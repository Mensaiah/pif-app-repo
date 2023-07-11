import fs from 'fs';
import path from 'path';

import { Connection } from 'mysql2/promise';
import mysql from 'mysql2/promise';

import { consoleLog } from '../utils/helpers';

export const doAppUserAccountsMigrations = async (sql: Connection) => {
  consoleLog('Partners Migration in progress');
  // SELECT *
  //   FROM users_pif
  //   LEFT JOIN users_pif_details ON users_pif.id = users_pif_details.user_id
  //   LEFT JOIN users_pif_devices ON users_pif.id = users_pif_devices.user_id
  //   LEFT JOIN users_pif_kickback_points ON users_pif.id = users_pif_kickback_points.user_id
  //   LEFT JOIN users_pif_payment_methods ON users_pif.id = users_pif_payment_methods.user_id
  //   WHERE users_pif.deleted_at IS NULL;
  /*
SELECT 
    users_pif.id as users_pif_id, 
    users_pif_details.id as users_pif_details_id,
    users_pif_devices.id as users_pif_devices_id,
    users_pif_kickback_points.id as users_pif_kickback_points_id,
    users_pif_payment_methods.id as users_pif_payment_methods_id,
    -- Include all other necessary columns here with unique aliases
  FROM users_pif 
  LEFT JOIN users_pif_details ON users_pif.id = users_pif_details.user_id 
  LEFT JOIN users_pif_devices ON users_pif.id = users_pif_devices.user_id 
  LEFT JOIN users_pif_kickback_points ON users_pif.id = users_pif_kickback_points.user_id 
  LEFT JOIN users_pif_payment_methods ON users_pif.id = users_pif_payment_methods.user_id 
  WHERE users_pif.deleted_at IS NULL;
*/
  const sqlQuery = `
  SELECT
    users_pif.*,
    users_pif_details.sex as details.sex,
    users_pif_devices.country as details.country,
    users_pif_details.city as details.city,
    users_pif_details.street as details.street,
    users_pif_details.age as details.age,
    users_pif_details.day_of_birth as details.day_of_birth,
    users_pif_details.occupation as details.occupation,
    users_pif_details.relationship as details.relationship,
    users_pif_details.children as details.children,
    users_pif_details.interests as details.interests,
    users_pif_details.deleted_at as details.deleted_at,
    users_pif_details.created_at as details.created_at,
    users_pif_details.updated_at as details.updated_at,
    users_pif_devices.locale as device.locale,
    users_pif_devices.phone_number_prefix as device.phone_number_prefix,
    users_pif_devices.phone_number as device.phone_number,
    users_pif_devices.country as device.country,
    users_pif_devices.pin as device.pin,
    users_pif_devices.blocked as device.blocked,
    users_pif_devices.confirmed as device.confirmed,
    users_pif_devices.sms_code as device.sms_code,
    users_pif_devices.device_id as device.device_id,
    users_pif_devices.soft as device.soft,
    users_pif_devices.uuid as device.uuid,
    users_pif_devices.os_user_id as device.os_user_id,
    users_pif_devices.push_status as device.push_status,
    users_pif_devices.app_rated as device.app_rated,
    users_pif_devices.registration_step as device.registration_step,
    users_pif_devices.process_change_number as device.process_change_number,
    users_pif_devices.process_change_pin as device.process_change_pin,
    users_pif_devices.last_login_at as device.last_login_at,
    users_pif_devices.created_at as users_pif_devices_created_at,
    users_pif_devices.updated_at as users_pif_devices_updated_at,
    users_pif_kickback_points.marketplace as kickback_points.marketplace,
    users_pif_kickback_points.points as kickback_points.points,
    users_pif_kickback_points.created_at as kickback_points.created_at,
    users_pif_kickback_points.updated_at as kickback_points.updated_at,
    users_pif_payment_methods.name as payment_method.name,
    users_pif_payment_methods.token as payment_method.token,
    users_pif_payment_methods.driver as payment_method.driver,
    users_pif_payment_methods.method as payment_method.method,
    users_pif_payment_methods.signature as payment_method.signature,
    users_pif_payment_methods.created_at as payment_method.created_at,
    users_pif_payment_methods.updated_at as payment_method.updated_at
    users_pif_payment_methods.deleted_at as payment_method.deleted_at
    FROM users_pif 
  LEFT JOIN users_pif_details ON users_pif.id = users_pif_details.user_id 
  LEFT JOIN users_pif_devices ON users_pif.id = users_pif_devices.user_id 
  LEFT JOIN users_pif_kickback_points ON users_pif.id = users_pif_kickback_points.user_id 
  LEFT JOIN users_pif_payment_methods ON users_pif.id = users_pif_payment_methods.user_id 
  WHERE users_pif.deleted_at IS NULL;
  `;

  const [rows] = (await sql.query(sqlQuery)) as unknown as [
    mysql.RowDataPacket[],
    mysql.FieldPacket[]
  ];

  const users = rows.map((row) => {
    // You will need to replace deviceColumn1, deviceColumn2, etc. with your actual column names
    const { deviceColumn1, deviceColumn2, deviceColumn3, ...rest } = row;

    return {
      ...rest,
      devices: {
        deviceColumn1,
        deviceColumn2,
        deviceColumn3,
      },
    };
  });

  consoleLog('users: ' + JSON.stringify(users.slice(0, 5), null, 2));
  consoleLog('users length: ' + users.length);

  fs.writeFileSync(
    path.join(__dirname, './data/appUsers.json'),
    JSON.stringify(users, null, 2)
  );

  // const partners = rows.map((partner: any) => ({
  //   ...partner,
  //   logo_crop_data: partner.logo_crop_data
  //     ? JSON.parse(partner.logo_crop_data)
  //     : null,
  // }));

  // consoleLog('rows length: ' + rows.length);
  // const durationTypeKeys = { 1: 'daily', 2: 'monthly', 3: 'weekly' };

  // const mongoWriteOps = await PartnerModel.bulkWrite(
  //   partners.map((partner: any) => ({
  //     updateOne: {
  //       filter: { old_id: partner.id },
  //       update: {
  //         $setOnInsert: {
  //           old_id: partner.id,
  //           isLegacyData: true,
  //           name: partner.name,
  //           email: partner.email,
  //           marketplaces: [partner.marketplace],
  //           vat: partner.vat,
  //           phone: partner.phone,
  //           fax: partner.fax,
  //           website: partner.www,
  //           isCharity: partner.is_charity,
  //           logo: partner.logo,
  //           logoCropData: partner.logo_crop_data,
  //           headquarter: {
  //             country: partner.country,
  //             city: partner.city,
  //             zipCode: partner.zipcode,
  //             address: partner.address,
  //           },
  //           paymentDetails: {
  //             accountNumber: partner.payment_account_number,
  //             accountName: partner.payment_recipient,
  //             notifyEmail: true,
  //             currency: partner.settling_currency,
  //           },
  //           settlingDetails: {
  //             amountThreshold: partner.settling_amount,
  //             transactionFee: partner.settling_transaction_fee,
  //             transactionFeeValue: partner.settling_transaction_fee_value,
  //             periodType:
  //               durationTypeKeys[partner.settling_period_type as 1 | 2 | 3],
  //             settlingType: partner.settling_type,
  //             startProportion: partner.settling_proportion_start,
  //             finishProportion: partner.settling_proportion_finish,
  //             pifProportion: partner.settling_proportion_pif,
  //             fixedFee: partner.settling_fixed_fee,
  //           },
  //           rolesAndPermissions: defaultUserTypesRolesAndPermissions[2].roles,
  //         },
  //       },
  //       upsert: true,
  //     },
  //   }))
  // );

  // consoleLog(
  //   'mongoWriteOps: ' + JSON.stringify(mongoWriteOps, null, 2),
  //   'info'
  // );
};
