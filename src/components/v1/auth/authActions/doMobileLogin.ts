import { Response } from 'express';
import ms from 'ms';
import appConfig from 'src/config';
import { IRequest } from 'src/types/global';
import { handleResponse, uuid } from 'src/utils/helpers';
import { useWord } from 'src/utils/wordSheet';
import { z } from 'zod';
import { UserModel } from '../../user/user.model';
import { UserAccessModel } from '../auth.models';
import { mobileLoginSchema } from '../auth.policy';
import { UserSessionAttributes } from '../auth.types';
import { calculateLoginWaitingTime, generateToken } from '../auth.utils';

const doMobileLogin = async (req: IRequest, res: Response) => {
  type LoginDatatype = z.infer<typeof mobileLoginSchema>;

  const { phone, phonePrefix, pin }: LoginDatatype = req.body;

  try {
    const existingUser = await UserModel.findOne({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });

    if (!existingUser)
      return handleResponse(res, 'You need to signup first', 401);

    if (!existingUser.isConfirmed && !existingUser.isSignupComplete)
      return handleResponse(res, 'You need to confirm your OTP', 401);

    const userAccess = await UserAccessModel.findOne({
      User: existingUser._id,
    });
    if (!userAccess) return handleResponse(res, 'Invalid credentials', 401);
    if (userAccess.isBlocked)
      return handleResponse(
        res,
        'Your account has been disabled. If you think this was a mistake, please contact us',
        401
      );

    if (!userAccess.securityCode) {
      userAccess.securityCode = uuid();
      await userAccess.save();
    }

    const { allowedAttempts, remainingTime } = calculateLoginWaitingTime(
      userAccess.failedLoginAttempts,
      userAccess.lastLoginAttempt
    );
    const now = Date.now();

    if (
      userAccess.failedLoginAttempts >= allowedAttempts &&
      userAccess.lastLoginAttempt &&
      remainingTime > 0
    ) {
      const waitMinutes = Math.ceil(remainingTime / (60 * 1000));
      return handleResponse(
        res,
        `Too many failed login attempts. Please wait for ${waitMinutes} minutes and try again.`,
        429
      );
    }

    if (!userAccess.comparePin(pin)) {
      userAccess.failedLoginAttempts += 1;
      userAccess.lastLoginAttempt = new Date(now);
      await userAccess.save();

      return handleResponse(res, 'Incorrect pin', 401);
    } else {
      userAccess.failedLoginAttempts = 0;
      userAccess.lastLoginAttempt = null;
      userAccess.lastLoginAt = new Date(now);
      await userAccess.save();
    }

    // find session index, if it exists, update it, if not create it
    const currentSessionIndex: number = userAccess.sessions?.findIndex(
      (session) => session.deviceHash === req.fingerprint.hash
    );

    let currentSession: UserSessionAttributes = userAccess.sessions?.find(
      (session) => session.deviceHash === req.fingerprint.hash
    );

    if (currentSessionIndex !== -1) {
      // updated session if found
      currentSession.used += 1;
      currentSession.lastEventTime = new Date();
      currentSession.maxLivespan = ms(appConfig.authConfigs.sessionLivespan);
      currentSession.maxInactivity = ms(appConfig.authConfigs.maxInactivity);
      currentSession.lastEventTime = new Date();
      userAccess.sessions[currentSessionIndex] = currentSession;
    } else {
      // new session if none is found

      currentSession = {
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

      userAccess.sessions.push(currentSession);
    }

    await userAccess.save();

    const token = generateToken({
      authKey: userAccess.securityCode,
      deviceId: req.fingerprint.hash,
      userType: existingUser.userType,
      sessionId: '11',
      ref: existingUser._id,
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: appConfig.isProd,
      sameSite: 'lax',
      maxAge: ms(appConfig.authConfigs.sessionLivespan),
    });

    return handleResponse(res, {
      message: 'Login successful, Welcome 🤗',
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
export default doMobileLogin;
