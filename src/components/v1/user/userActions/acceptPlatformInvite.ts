import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import appConfig from '../../../../config';
import { IRequest } from '../../../../types/global';
import { consoleLog, handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserAccessModel } from '../../auth/auth.models';
import { UserSessionAttributes } from '../../auth/auth.types';
import {
  generateToken,
  getPermissions,
  getRoleAndPermissions,
} from '../../auth/auth.utils';
import CityModel from '../../city/city.model';
import PlatformModel from '../../platform/platform.model';
import { PartnerPosUserModel, UserInviteModel, UserModel } from '../user.model';
import { acceptPlatformInviteSchema } from '../user.policy';

const acceptPlatformInvite = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof acceptPlatformInviteSchema>;

  const { code, email, name, password, phone, phonePrefix }: dataType =
    req.body;

  try {
    const existingInvite = await UserInviteModel.findOne({
      email,
      code,
    });

    if (!existingInvite)
      return handleResponse(
        res,
        'Invalid operation. Please contact the admin.',
        401
      );

    const platformData = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platformData) {
      return handleResponse(
        res,
        "operation failed. It's not you but us. Please try again later",
        401
      );
    }

    const permissions = getPermissions(
      platformData,
      existingInvite.userType,
      existingInvite.role
    );

    // TODO: remove
    if (!permissions) {
      return handleResponse(
        res,
        'Invalid operation. Please contact the admin.',
        400
      );
    }

    const newUser =
      existingInvite.role === 'pos-user'
        ? new PartnerPosUserModel({
            Partner: existingInvite.Partner,
            name,
            email,
            contact: {
              phonePrefix,
              phone,
            },
            Pos: existingInvite.Pos,
          })
        : new UserModel({
            name,
            email,
            contact: {
              phonePrefix,
              phone,
            },
            userType: existingInvite.userType,
          });

    const now = new Date();

    let newUserAccess = new UserAccessModel({
      User: newUser._id,
      password,
      securityCode: uuid(),
      lastLoginAt: now,
      lastEventTime: now,
      failedLoginAttempts: 0,
      role: existingInvite.role,
      permissions,
      marketplaces: existingInvite.marketplaces,
    });

    if (existingInvite.userType === 'partner-admin') {
      newUser.Partner = existingInvite.Partner;

      if (
        existingInvite.role === 'local-partner' ||
        existingInvite.role === 'pos-user'
      ) {
        const city = await CityModel.findOne({
          name: {
            $elemMatch: {
              value: existingInvite.City,
            },
          },
        });
        if (city) {
          newUserAccess.citiesCovered = [city._id];
        }
      }
    }

    const newSession: UserSessionAttributes = {
      used: 1,
      deviceHash: req.fingerprint.hash,
      sessionId: uuid(),
      lastEventTime: new Date(),
      maxLivespan: ms(appConfig.authConfigs.sessionLivespan),
      maxInactivity: ms(appConfig.authConfigs.maxInactivity),
      device: {
        info: req.fingerprint.components.userAgent,
        geoip: {
          lat: null,
          long: null,
        },
      },
    };

    newUserAccess.sessions.push(newSession);

    await newUser.save();
    await newUserAccess.save();

    newUserAccess = await UserAccessModel.findOne({
      _id: newUserAccess._id,
    }).populate('marketplaces', 'name');

    const token = generateToken({
      authKey: newUserAccess.securityCode,
      deviceId: req.fingerprint.hash,
      userType: existingInvite.userType,
      sessionId: newSession.sessionId,
      ref: newUser._id,
      role: newUserAccess.role,
    });

    // res.cookie('jwt', token, {
    //   httpOnly: true,
    //   secure: appConfig.isProd,
    //   sameSite: 'lax',
    //   maxAge: ms(appConfig.authConfigs.sessionLivespan),
    // });

    return handleResponse(res, {
      message: 'Operation successful, Welcome 🤗',
      data: {
        token,
        userData: {
          name: newUser.name,
          avatar: newUser.avatar,
          userType: existingInvite.userType,
          role: newUserAccess.role,
          permissions: newUserAccess.permissions,
          marketplaces: newUserAccess.marketplaces,
        },
      },
    });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default acceptPlatformInvite;
