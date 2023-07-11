import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { UserAccessModel } from '../components/v1/auth/auth.models';
import { PartnerModel } from '../components/v1/partner/partner.model';
import {
  PartnerPosUserModel,
  UserModel,
} from '../components/v1/user/user.model';
import { UserType } from '../components/v1/user/user.types';
import { consoleLog } from '../utils/helpers';

export const doPlatformAccountsMigrations = async (sql: Connection) => {
  consoleLog('Users Migration in progress');

  const sqlQuery = `
  SELECT 
      users.*,
      roles.space AS roleSpace,
      roles.key AS roleKey,
      roles.name AS roleName,
      roles.description AS roleDescription,
      roles.weight AS roleWeight,
      roles.deleted_at AS roleDeletedAt,
      GROUP_CONCAT(permissions.key) AS permissions
    FROM 
      users
    LEFT JOIN 
      roles 
      ON users.role_id = roles.id
    LEFT JOIN 
      role_permission 
      ON roles.id = role_permission.role_id
    LEFT JOIN 
      permissions 
      ON role_permission.permission_id = permissions.id
    GROUP BY
      users.id;
  `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  const userOps = [];
  const posUserOps = [];
  const usersFromSql = [];

  const userTypeKeys = {
    Admin: 'platform-admin',
    Root: 'platform-admin',
    'Country Admin': 'platform-admin',
    partner: 'partner-admin',
    'Local Partner': 'partner-admin',
    'Partner admin': 'partner-admin',
    POS: 'pos-user',
  };
  const userRoleKeys = {
    Admin: 'admin',
    Root: 'super-admin',
    'Country Admin': 'country-admin',
    partner: 'partner-admin',
    'Local Partner': 'local-partner',
    'Partner admin': 'partner-admin',
    POS: 'pos-user',
  };

  for (const user of rows) {
    let partnerId = null;
    if (user.partner_id) {
      const partner = await PartnerModel.findOne(
        { old_id: user.partner_id },
        '_id'
      );

      if (partner) {
        partnerId = partner._id;
      }
    }

    const userWithPermissions: any = {
      ...user,
      Partner: partnerId,
      permissions: user.permissions
        ? user.permissions
            .split(',')
            .filter((permission: string) => Boolean(permission.trim()))
        : [],
    };
    usersFromSql.push(userWithPermissions);

    if (userWithPermissions.roleName === 'POS') {
      posUserOps.push({
        updateOne: {
          filter: { old_id: userWithPermissions.id },
          update: {
            $set: {
              old_id: userWithPermissions.id,
              isLegacyData: true,
              Partner: userWithPermissions.Partner,
              name: userWithPermissions.name,
              email: userWithPermissions.email,
              timezone: userWithPermissions.timezone,
            },
          },
          upsert: true,
        },
      });
    } else {
      userOps.push({
        updateOne: {
          filter: { old_id: userWithPermissions.id },
          update: {
            $set: {
              old_id: userWithPermissions.id,
              isLegacyData: true,
              name: userWithPermissions.name,
              email: userWithPermissions.email,
              timezone: userWithPermissions.timezone,
              Partner: userWithPermissions.Partner,
              userType: (userTypeKeys[
                userWithPermissions.roleName as keyof typeof userTypeKeys
              ] || 'partner-admin') as UserType,
            },
          },
          upsert: true,
        },
      });
    }
  }

  // Execute bulkWrite operations
  const userMongoWriteOps = await UserModel.bulkWrite(userOps);
  const posUserMongoWriteOps = await PartnerPosUserModel.bulkWrite(posUserOps);

  // Get the MongoDB _id for each user
  const users = await UserModel.find(
    {
      old_id: { $in: rows.map((row) => row.id) },
    },
    '_id old_id Partner'
  );
  const partnerPosUsers = await PartnerPosUserModel.find(
    {
      old_id: { $in: rows.map((row) => row.id) },
    },
    '_id old_id Partner'
  );

  const userAccessOps = usersFromSql.map((user) => {
    const userAccessData: any = {
      old_id: user.id,
      isLegacyData: true,
      password: user.password,
      role:
        userRoleKeys[user.roleName as keyof typeof userRoleKeys] ||
        'partner-admin',
      permissions: user.permissions.map((permission: string) => {
        if (permission.includes('privacy-policy'))
          permission = permission.replace('privacy-policy', 'policy');

        return permission;
      }),
    };

    if (user.roleName === 'POS') {
      userAccessData.PartnerPosUser = partnerPosUsers.find(
        (user) => user.old_id === user.id
      )?._id;
    } else {
      userAccessData.User = users.find((user) => user.old_id === user.id)?._id;
    }

    if (user.marketplace) userAccessData.marketplaces = [user.marketplace];

    return {
      updateOne: {
        filter: { old_id: user.id },
        update: {
          $setOnInsert: userAccessData,
        },
        upsert: true,
      },
    };
  });

  const userAccessMongoWriteOps = await UserAccessModel.bulkWrite(
    userAccessOps
  );

  consoleLog(
    'User bulkWrite result: ' + JSON.stringify(userMongoWriteOps, null, 2),
    'info'
  );
  consoleLog(
    'PartnerPosUser bulkWrite result: ' +
      JSON.stringify(posUserMongoWriteOps, null, 2),
    'info'
  );
  consoleLog(
    'UserAccess bulkWrite result: ' +
      JSON.stringify(userAccessMongoWriteOps, null, 2),
    'info'
  );
};
