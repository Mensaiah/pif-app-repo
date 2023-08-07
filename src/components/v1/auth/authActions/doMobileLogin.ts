import { Response } from 'express';
import { Document } from 'mongoose';
import ms from 'ms';
import { z } from 'zod';

import appConfig from '../../../../config';
import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { UserAttributes } from '../../user/user.types';
import { linkUserToStripe } from '../../user/user.utils';
import { UserAccessModel } from '../auth.models';
import { mobileLoginSchema } from '../auth.policy';
import { UserAccessAttributes, UserSessionAttributes } from '../auth.types';
import {
  calculateLoginWaitingTime,
  createNewSession,
  generateToken,
} from '../authUtils';

const doMobileLogin = async (req: IRequest, res: Response) => {
  type LoginDatatype = z.infer<typeof mobileLoginSchema>;

  const { phone, phonePrefix, pin }: LoginDatatype = req.body;

  try {
    const existingUsers = await UserModel.find({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });

    if (existingUsers.length === 0)
      return handleResponse(res, 'Account does not exist', 401);

    let userAccess: undefined | (UserAccessAttributes & Document);
    let existingUser: undefined | (UserAttributes & Document);

    if (existingUsers.length > 1) {
      const userIds = existingUsers.map((user) => user._id);

      const userAccesses = await UserAccessModel.find({
        User: { $in: userIds },
      });

      if (userAccesses.length === 0)
        return handleResponse(res, 'You need to sign up first', 401);

      userAccess = userAccesses.find(
        (access) => access.pin && access.comparePin(pin)
      );

      if (!userAccess)
        return handleResponse(res, 'invalid login credentials', 401);

      existingUser = existingUsers.find(
        (user) => user._id.toString() === userAccess.User.toString()
      );
    } else {
      userAccess = await UserAccessModel.findOne({
        User: existingUsers[0]._id,
      });

      if (!userAccess)
        return handleResponse(res, 'invalid login credentials', 401);

      existingUser = existingUsers[0];
    }

    // if (!existingUser.isConfirmed && !existingUser.isSignupComplete)
    //   return handleResponse(res, 'You need to confirm your OTP', 401);

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

    if (!userAccess.pin) {
      return handleResponse(
        res,
        "You didn't set your pin, please use forgot pin",
        401
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

    const currentDate = new Date(now);

    if (currentSessionIndex !== -1) {
      // updated session if found
      currentSession.used += 1;
      currentSession.lastEventTime = currentDate;
      currentSession.maxLivespan = ms(appConfig.authConfigs.sessionLivespan);
      currentSession.maxInactivity = ms(appConfig.authConfigs.maxInactivity);
      currentSession.lastEventTime = currentDate;
      userAccess.sessions[currentSessionIndex] = currentSession;
    } else {
      // new session if none is found

      currentSession = createNewSession(req);

      userAccess.sessions.push(currentSession);
    }

    if (userAccess.isLegacyData && !userAccess.isLegacyAccountValidated) {
      userAccess.updatePin(pin);
    }

    await userAccess.save();

    // check if currentMaketplace is supported by stripe and set customerId if it's not set
    await linkUserToStripe(existingUser);

    const token = generateToken({
      authKey: userAccess.securityCode,
      deviceId: req.fingerprint.hash,
      userType: existingUser.userType,
      sessionId: currentSession.sessionId,
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
      message: 'Login successful, Welcome 🤗',
      data: {
        token,
        userData: {
          name: existingUser.name,
          pifId: existingUser.pifId,
          avatar: existingUser.avatar,
          currentMarketplace: existingUser.currentMarketplace,
          phonePrefix: existingUser.contact.phonePrefix,
          phone: existingUser.contact.phone,
          shouldEnforceConfirmation: existingUser.shouldEnforceConfirmation,
          isConfirmed: existingUser.isConfirmed,
        },
      },
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default doMobileLogin;
