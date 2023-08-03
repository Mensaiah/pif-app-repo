import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';

import appConfig from '../../../config';
import platformConstants from '../../../config/platformConstants';
import { sendMail } from '../../../services/emailServices/mailgun.service';
import { sendSms } from '../../../services/infobip.service';
import { IRequest, IToken } from '../../../types/global';
import { capitalize } from '../../../utils/helpers';
import { hasAccessToMarketplaces } from '../../../utils/queryHelpers/helpers';
import PlatformModel from '../platform/platform.model';
import { PlatformAttributes } from '../platform/platform.types';
import { UserAttributes } from '../user/user.types';

import { OtpCodeModel } from './auth.models';

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

export const sendPlatformInviteMail = ({
  to,
  url,
}: {
  to: string;
  url: string;
}) =>
  sendMail({
    to,
    subject: 'PIF Invitation',
    content: `Hello,
    <br>
    <br>
You've been invited to join the PIF Platform as an admin. Click the link below to join <br>
${url} <br><br>
<small>This link expires in 24 hrs</small>
<br><br>
If you think this is a mistake, please ignore this email.
<br>
<br>
<br>
Regards,
<br>
Pif Team.
  `,
  });

export const sendPartnerAdminInviteMail = ({
  to,
  url,
  adminName,
  partnerName,
}: {
  to: string;
  url: string;
  adminName: string;
  partnerName: string;
}) =>
  sendMail({
    to,
    subject: 'PIF Invitation',
    content: `Hi ${capitalize(adminName)},
    <br>
    <br>
You've been invited as an admin of ${capitalize(
      partnerName
    )} on PIF Platform. Please click on this link below to accept the invitation. <br>
${url} <br><br>
<small>This link expires in 24 hrs</small>
<br><br>
If you think this is a mistake, please ignore this email.
<br>
<br>
<br>
Regards,
<br>
Pif Team.
  `,
  });

export const sendForgotPasswordCodeMail = ({
  to,
  code,
}: {
  to: string;
  code: string;
}) =>
  sendMail({
    to,
    subject: 'Reset your PIF password',
    content: `<div style="max-width: 600px; margin: 0 auto;">
      <h2 style="color: #444;">Hello,</h2>
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please use the following verification code to proceed:</p>
      <div style="background: #eee; padding: 10px; text-align: center;">
        <strong style="font-size: 1.5rem;">${code}</strong>
      </div>
      <p>This code is only valid for 15 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>Best,</p>
      <p>PIF Team</p>
    </div>
  `,
  });

export const isDateLessThanXMinutesAgo = (date: Date, min = 1): boolean => {
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
  user: UserAttributes & Document
) => {
  try {
    if (user.isConfirmed) return;

    user.shouldEnforceConfirmation = true;

    const otp = await new OtpCodeModel({
      code: generateRandomCode(),
      email: user.email,
      phone: user.contact.phone,
      phonePrefix: user.contact.phonePrefix,
      purpose: 'confirm-account',
      lastSent: new Date(),
    }).save();

    await sendOTP(user.contact.phonePrefix + user.contact.phone, otp.code);

    await user.save();
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
