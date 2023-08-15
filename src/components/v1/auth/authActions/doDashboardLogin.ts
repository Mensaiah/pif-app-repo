import { Response } from 'express';
import mongoose from 'mongoose';
import ms from 'ms';
import { z } from 'zod';

import '../../../../services/infobip.service';
import appConfig from '../../../../config';
import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { UserAccessModel } from '../auth.models';
import { dashLoginSchema } from '../auth.policy';
import { UserSessionAttributes } from '../auth.types';
import {
  calculateLoginWaitingTime,
  createNewSession,
  generateToken,
} from '../authUtils';

const doDashboardLogin = async (req: IRequest, res: Response) => {
  type LoginDatatype = z.infer<typeof dashLoginSchema>;

  const { email, password }: LoginDatatype = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await UserModel.findOne({
      email: email,
      userType: { $ne: 'customer' },
    }).session(session);

    if (!existingUser) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Invalid login credentials', 401);
    }

    const userAccess = await UserAccessModel.findOne({
      User: existingUser._id,
      role: { $ne: 'customer' },
    }).session(session);

    if (!userAccess) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Invalid login credentials', 401);
    }

    if (userAccess.isBlocked) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'Your account has been disabled. If you think this was a mistake, please contact us',
        401
      );
    }

    if (!userAccess.securityCode) {
      userAccess.securityCode = uuid();
      await userAccess.save({ session });
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
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        `Too many failed login attempts. Please wait for ${waitMinutes} minutes and try again.`,
        429
      );
    }

    // TODO: send OTP to user logging in from a strange location

    if (!userAccess.comparePassword(password)) {
      userAccess.failedLoginAttempts += 1;
      userAccess.lastLoginAttempt = new Date(now);

      await userAccess.save({ session });

      await session.commitTransaction();
      session.endSession();

      return handleResponse(res, 'Invalid login credentials', 401);
    } else {
      userAccess.failedLoginAttempts = 0;
      userAccess.lastLoginAttempt = null;
      userAccess.lastLoginAt = new Date(now);
      await userAccess.save({ session });
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

      currentSession = createNewSession(req);

      userAccess.sessions.push(currentSession);
    }

    if (userAccess.isLegacyData && !userAccess.isLegacyAccountValidated) {
      userAccess.updatePassword(password);
    }

    await userAccess.save({ session });

    const token = generateToken({
      authKey: userAccess.securityCode,
      deviceId: req.fingerprint.hash,
      userType: existingUser.userType,
      role: userAccess.role,
      sessionId: currentSession.sessionId,
      ref: existingUser._id,
    });
    // res.cookie('jwt', token, {
    //   httpOnly: true,
    //   secure: !appConfig.isDev,
    //   // sameSite: 'lax',
    //   sameSite: 'none',
    //   maxAge: ms(appConfig.authConfigs.sessionLivespan),
    // });

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, {
      message: 'Login successful, Welcome 🤗',
      data: {
        token,
        userData: {
          name: existingUser.name,
          avatar: existingUser.avatar,
          userType: existingUser.userType,
          role: userAccess.role,
          permissions: userAccess.permissions,
          marketplaces: userAccess.marketplaces,
          hasOneSignalPlayerId: !!existingUser.oneSignalPlayerId,
        },
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default doDashboardLogin;
