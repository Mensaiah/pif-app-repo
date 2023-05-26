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
If you think this is a mistake, please ignore this email.
<br>
<br>
<br>
Regards,
<br>
Pif Team.
  `,
  });

export const isDateLessThanXMinutesAgo = (date: Date, min = 1): boolean => {
  const minutesAgo = new Date(Date.now() - min * 60 * 1000);
  return date > minutesAgo;
};
