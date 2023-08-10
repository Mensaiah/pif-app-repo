import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose, { Document, mongo } from 'mongoose';
import ms from 'ms';

import appConfig from '../../../../config';
import platformConstants from '../../../../config/platformConstants';
import { sendSms } from '../../../../services/infobip.service';
import { IRequest, IToken } from '../../../../types/global';
import { uuid } from '../../../../utils/helpers';
import { hasAccessToMarketplaces } from '../../../../utils/queryHelpers/helpers';
import PlatformModel from '../../platform/platform.model';
import { PlatformAttributes } from '../../platform/platform.types';
import { UserAttributes } from '../../user/user.types';
import { OtpCodeModel } from '../auth.models';
import { UserSessionAttributes } from '../auth.types';

export const verifyCaptcha = async (token: string) => {
  try {
    const { data } = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: appConfig.reCaptchaSecretKey,
          response: token,
        },
      }
    );

    return data.success;
  } catch (error) {
    return false;
  }
};

export const calculateLoginWaitingTime = (
  failedAttempts: number,
  lastLoginAttempt: Date
) => {
  const now = Date.now();

  const timePassed = lastLoginAttempt ? now - lastLoginAttempt.getTime() : 0;

  if (failedAttempts < 5) {
    return { allowedAttempts: 5, remainingTime: 0 };
  } else if (failedAttempts < 8) {
    const waitingTime = 30 * 60 * 1000; // 30 minutes
    return {
      allowedAttempts: 3,
      remainingTime: Math.max(waitingTime - timePassed, 0),
    };
  } else if (failedAttempts < 11) {
    const waitingTime = 60 * 60 * 1000; // 1 hour
    return {
      allowedAttempts: 3,
      remainingTime: Math.max(waitingTime - timePassed, 0),
    };
  }

  const waitingTime = 3 * 60 * 60 * 1000; // 3 hours
  return {
    allowedAttempts: 3,
    remainingTime: Math.max(waitingTime - timePassed, 0),
  };
};

export const generateToken = (
  data: IToken,
  expiresIn = appConfig.authConfigs.sessionLivespan
): string =>
  jwt.sign(data, appConfig.authConfigs.jwtSecret, {
    expiresIn: expiresIn,
    issuer: `PIF-${appConfig.environment}`,
  });

export const generateRandomCode = (length = 5): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const randomCode = Math.floor(Math.random() * (max - min + 1) + min);
  return randomCode.toString();
};

export const sendOTP = (to: string, code: string) =>
  sendSms({
    to,
    text: `Your one time PIF OTP (Verification) code is ${code} Don't share with anyone please.`,
  });

export const isDateLessThanXMinutesAgo = (
  date: Date,
  min = platformConstants.otpResendWaitingMinutes
): boolean => {
  const minutesAgo = new Date(Date.now() - min * 60 * 1000);
  return date > minutesAgo;
};

export const getRoleAndPermissions = async (
  userType: string,
  userRole: string
) => {
  const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

  for (const userTypeRole of platform.defaultUserTypesAndRoles) {
    if (userTypeRole.userType === userType) {
      for (const role of userTypeRole.roles) {
        if (role.name === userRole) {
          return {
            role: role.name,
            permissions: role.permissions || [], // assuming 'permissions' key exists
          };
        }
      }
    }
  }
  // If no matching userType and role found, return undefined or any suitable default
  return {};
};

export const getUserRolesAndPermissions = (
  userType: string,
  platformData: PlatformAttributes & Document
) =>
  platformData.defaultUserTypesAndRoles
    .filter((platformUserType) => platformUserType.userType === userType)[0]
    .roles.map(({ name, permissions }) => {
      return { role: name, permissions };
    }) || [];

export const getPermissions = (
  platform: PlatformAttributes & Document,
  userType: string,
  userRole: string
) => {
  if (!platform) return [];

  return (
    platform.defaultUserTypesAndRoles
      .filter(
        ({ userType: platformUserType }) => userType === platformUserType
      )[0]
      ?.roles.filter(({ name }) => name === userRole)[0]?.permissions || []
  );
};

export const sendOtpToSenderIfNotConfirmed = async (
  user: UserAttributes & Document,
  session: mongoose.ClientSession
) => {
  try {
    if (user.isConfirmed) return;

    user.shouldEnforceConfirmation = true;

    const otp = await new OtpCodeModel({
      User: user._id,
      code: generateRandomCode(),
      email: user.email,
      phone: user.contact.phone,
      phonePrefix: user.contact.phonePrefix,
      purpose: 'confirm-account',
      lastSent: new Date(),
    }).save({ session });

    await sendOTP(user.contact.phonePrefix + user.contact.phone, otp.code);

    await user.save({ session });
  } catch (err) {
    throw err;
  }
};

export const isPlatformAdminWithMarketplaceAccess = (
  req: IRequest,
  marketplace: string | string[]
): boolean => {
  if (req.isUserTopLevelAdmin) {
    return true;
  }

  return hasAccessToMarketplaces(req, marketplace);
};

export const createNewSession = (req: IRequest): UserSessionAttributes => ({
  used: 1,
  deviceHash: req.fingerprint.hash,
  sessionId: uuid(),
  lastEventTime: new Date(),
  maxLivespan: ms(appConfig.authConfigs.sessionLivespan),
  maxInactivity: ms(appConfig.authConfigs.maxInactivity),
  device: {
    info: req.fingerprint.components.userAgent,
    geoip: {
      lat: req.fingerprint.components.geo?.ll
        ? req.fingerprint.components.geo.ll[0]
        : null,
      long: req.fingerprint.components.geo?.ll
        ? req.fingerprint.components.geo.ll[1]
        : null,
    },
  },
});
