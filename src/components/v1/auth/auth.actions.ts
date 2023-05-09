import { Response } from 'express';
import { IRequest } from 'src/types/global';
import { handleResponse, uuid } from 'src/utils/helpers';
import { dashLoginSchema, mobileLoginSchema } from './auth.policy';
import { z } from 'zod';
import { UserModel } from '../user/user.model';
import { useWord } from 'src/utils/wordSheet';
import { UserAccessModel } from './auth.models';
import { calculateLoginWaitingTime, generateToken } from './auth.utils';
import appConfig from 'src/config';
import ms from 'ms';
import { UserSessionAttributes } from './auth.types';
import '../../../services/infobipService';
import { sendSms } from '../../../services/infobipService';

export const doDashboardLogin = async (req: IRequest, res: Response) => {
  type LoginDatatype = z.infer<typeof dashLoginSchema>;

  const { email, password }: LoginDatatype = req.body;

  try {
    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser)
      return handleResponse(res, 'Invalid login credentials', 401);

    const userAccess = await UserAccessModel.findOne({
      User: existingUser._id,
    });
    if (!userAccess)
      return handleResponse(res, 'Invalid login credentials', 401);

    if (existingUser.userType === 'customer')
      return handleResponse(res, 'Login on the mobile app instead', 401);

    if (userAccess.isBlocked) {
      return handleResponse(
        res,
        'Your account has been disabled.  If you think this was a mistake, please contact us',
        401
      );
    }

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

    if (!userAccess.comparePassword(password)) {
      userAccess.failedLoginAttempts += 1;
      userAccess.lastLoginAttempt = new Date(now);
      await userAccess.save();

      return handleResponse(res, 'Invalid login credentials', 401);
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
          info: `${req.fingerprint.components.userAgent}`,
          geoip: {
            lat: null,
            long: null,
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
        avatar: existingUser.avatar,
        userType: existingUser.userType,
        roleAndPermissions: userAccess.rolesAndPermissions,
      },
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const doMobileSignup = async (req: IRequest, res: Response) => {
  type signUpDatatype = z.infer<typeof mobileLoginSchema>;

  const { phone, phonePrefix }: signUpDatatype = req.body;

  try {
    return handleResponse(res, { phonePrefix, phone });
  } catch (error) {}
};

export const doMobileLogin = async (req: IRequest, res: Response) => {
  type LoginDatatype = z.infer<typeof mobileLoginSchema>;

  const { phone, phonePrefix }: LoginDatatype = req.body;

  try {
    await sendSms({
      to: '2348168861541',
      text: 'Your one time PIF OTP code is 09876',
    });
    // const checkOtpExists = await UserModel.findOne({});

    return handleResponse(res, { phonePrefix, phone });
  } catch (error) {}
};

export const doLogout = (req: IRequest, res: Response) => {
  res.clearCookie('jwt');
  handleResponse(res, useWord('loggedOut', req.lang));
};
