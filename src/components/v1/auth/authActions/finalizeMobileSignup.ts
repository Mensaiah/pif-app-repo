import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import appConfig from '../../../../config';
import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel, UserAccessModel } from '../auth.models';
import { finalizeMobileSignupSchema } from '../auth.policy';
import { UserSessionAttributes } from '../auth.types';
import { generateToken } from '../auth.utils';

const finalizeSignup = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof finalizeMobileSignupSchema>;
  const { name, dob, phone, phonePrefix, pifId, zipCode, otpCode }: dataType =
    req.body;

  try {
    const existingUser = await UserModel.findOne({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });

    if (!existingUser)
      return handleResponse(
        res,
        'Invalid operation. Please, let us know if you think this is an error',
        401
      );
    if (!existingUser.isConfirmed)
      return handleResponse(res, 'You need to verify your OTP first', 401);

    if (existingUser.isSignupComplete)
      return handleResponse(
        res,
        'Signup has already been finalized. No changes were made'
      );

    const otpExists = await OtpCodeModel.findOne({
      code: otpCode,
      purpose: 'signup',
      phone,
      phonePrefix,
    });

    if (!otpExists) return handleResponse(res, 'OTP code is invalid', 401);

    if (!otpExists.isConfirmed) {
      return handleResponse(res, 'Invalid credentials', 401);
    }

    existingUser.name = name;
    existingUser.dob = new Date(dob);
    existingUser.pifId = pifId;
    existingUser.contact.zip = zipCode;
    existingUser.isSignupComplete = true;
    otpExists.isDeleted = true;
    await existingUser.save();
    await otpExists.save();

    const now = new Date();
    const userAccess = new UserAccessModel({
      User: existingUser._id,
      securityCode: uuid(),
      lastLoginAt: now,
      lastEventTime: now,
      failedLoginAttempts: 0,
      role: 'customer',
      permissions: [],
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
    userAccess.sessions.push(newSession);
    await userAccess.save();

    const token = generateToken({
      authKey: userAccess.securityCode,
      deviceId: req.fingerprint.hash,
      userType: existingUser.userType,
      sessionId: newSession.sessionId,
      ref: existingUser._id,
      role: userAccess.role,
    });
    // res.cookie('jwt', token, {
    //   httpOnly: true,
    //   secure: appConfig.isProd,
    //   sameSite: 'lax',
    //   maxAge: ms(appConfig.authConfigs.sessionLivespan),
    // });

    return handleResponse(res, {
      message: 'Please create your pin',
      data: {
        token,
        userData: {
          name: existingUser.name,
          pifId: existingUser.pifId,
          avatar: existingUser.avatar,
          currentMarketplace: existingUser.currentMarketplace,
          phonePrefix: existingUser.contact.phonePrefix,
          phone: existingUser.contact.phone,
        },
      },
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default finalizeSignup;
