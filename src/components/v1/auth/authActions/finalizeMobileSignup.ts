import { Response } from 'express';
import ms from 'ms';
import appConfig from 'src/config';
import { IRequest } from 'src/types/global';
import { handleResponse, uuid } from 'src/utils/helpers';
import { useWord } from 'src/utils/wordSheet';
import { z } from 'zod';
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
      phone,
      phonePrefix,
      code: otpCode,
      purpose: 'signup',
    });
    if (!otpExists) return handleResponse(res, 'OTP code is invalid', 401);

    if (!otpExists.isConfirmed) {
      return handleResponse(res, 'Invalid credentials', 401);
    }

    existingUser.name = name;
    existingUser.dob = dob;
    existingUser.pifId = pifId;
    existingUser.contact.zip = zipCode;
    existingUser.isSignupComplete = true;
    await existingUser.save();
    await otpExists.deleteOne();

    const now = new Date();
    const userAccess = new UserAccessModel({
      User: existingUser._id,
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
          lat: req.fingerprint.components?.geo?.ll[0],
          long: req.fingerprint.components?.geo?.ll[1],
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
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: appConfig.isProd,
      sameSite: 'lax',
      maxAge: ms(appConfig.authConfigs.sessionLivespan),
    });

    return handleResponse(res, {
      message: 'Please create your pin',
      data: {
        name: existingUser.name,
        pifId: existingUser.pifId,
        avatar: existingUser.avatar,
        currentMarketplace: existingUser.currentMarketplace,
        phone: existingUser.contact.phone,
        phonePrefix: existingUser.contact.phonePrefix,
      },
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default finalizeSignup;
