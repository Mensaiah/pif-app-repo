import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import appConfig from '../../../../config';
import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserAccessModel } from '../../auth/auth.models';
import { UserSessionAttributes } from '../../auth/auth.types';
import { generateToken } from '../../auth/auth.utils';
import { InviteUserModel, UserModel } from '../user.model';
import { acceptPlatformInviteSchema } from '../user.policy';

const acceptPlatformInvite = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof acceptPlatformInviteSchema>;

  const { code, email, name, password, phone, phonePrefix, otp }: dataType =
    req.body;

  try {
    const existingInvite = await InviteUserModel.findOne({
      email,
      code,
    });

    if (!existingInvite)
      return handleResponse(
        res,
        'Invalid operation. Please contact the admin.',
        401
      );

    const newUser = new UserModel({
      name,
      email,
      contact: {
        phonePrefix,
        phone,
      },
    });

    // handle platform roles
    if (['admin', 'country-admin'].includes(existingInvite.role)) {
      if (existingInvite.role === 'admin') {
        newUser.userType = existingInvite.role;
      }

      if (existingInvite.role === 'country-admin') {
        newUser.currentMarketplace = existingInvite.currentMarketplace;
      }
    }

    // handle partner roles
    if (existingInvite.role === 'partner-admin') {
      if (existingInvite.role === 'partner-admin') {
        newUser.currentMarketplace = existingInvite.currentMarketplace;
        newUser.userType = existingInvite.role;
        newUser.Partner = existingInvite.Partner;
      }

      // if (existingInvite.role === 'local-partner') {
      //   newUser.userType = existingInvite.role;
      // }
    }

    const now = new Date();

    const newUserAccess = new UserAccessModel({
      User: newUser._id,
      password,
      securityCode: uuid(),
      lastLoginAt: now,
      lastEventTime: now,
      failedLoginAttempts: 0,
    });

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

    const token = generateToken({
      authKey: newUserAccess.securityCode,
      deviceId: req.fingerprint.hash,
      userType: newUser.userType,
      sessionId: newSession.sessionId,
      ref: newUser._id,
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: appConfig.isProd,
      sameSite: 'lax',
      maxAge: ms(appConfig.authConfigs.sessionLivespan),
    });

    return handleResponse(res, {
      message: 'Operation successful, Welcome 🤗',
      data: {
        name: newUser.name,
        avatar: newUser.avatar,
        userType: newUser.userType,
        roleAndPermissions: newUserAccess.rolesAndPermissions,
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
