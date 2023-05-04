import { Response } from 'express';
import { IRequest } from 'src/types/global';
import { consoleLog, handleResponse, uuid } from 'src/utils/helpers';
import { dashLoginSchema } from './auth.policy';
import { z } from 'zod';
import { UserModel } from '../user/user.model';
import { useWord } from 'src/utils/wordSheet';
import { UserAccessModel } from './auth.models';
import { calculateLoginWaitingTime, generateToken } from './auth.utils';
import appConfig from 'src/config';
import ms from 'ms';

export const doDashboardLogin = async (req: IRequest, res: Response) => {
  type LoginDatatype = z.infer<typeof dashLoginSchema>;
  consoleLog(JSON.stringify(req.body));
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

    const { allowedAttempts, waitingTime } = calculateLoginWaitingTime(
      userAccess.failedLoginAttempts
    );
    const now = Date.now();

    if (
      userAccess.failedLoginAttempts >= allowedAttempts &&
      userAccess.lastLoginAttempt &&
      now - userAccess.lastLoginAttempt.getTime() < waitingTime
    ) {
      const waitMinutes = Math.ceil(waitingTime / (60 * 1000));
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
      userAccess,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const doLogout = (req: IRequest, res: Response) => {
  res.clearCookie('jwt');
  handleResponse(res, useWord('loggedOut', req.lang));
};
