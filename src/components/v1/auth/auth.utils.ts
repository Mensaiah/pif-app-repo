import jwt from 'jsonwebtoken';

import appConfig from '../../../config';
import { sendSms } from '../../../services/infobipService';
import { sendMail } from '../../../services/mailgunService';
import { IToken } from '../../../types/global';
import { capitalize } from '../../../utils/helpers';

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
  sendSms({ to, text: `Your one time PIF OTP code is ${code}` });

export const sendVerificationMail = ({
  to,
  url,
  role,
}: {
  to: string;
  url: string;
  role: string;
}) =>
  sendMail({
    to,
    subject: 'PIF Invitation',
    content: `Hello,
    <br>
    <br>
You've been invited to join the PIF Platform as an ${capitalize(
      role
    )}. Click the link below to join <br>
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
