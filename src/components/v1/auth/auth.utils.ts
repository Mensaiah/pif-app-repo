import jwt from 'jsonwebtoken';
import appConfig from '../../../config';
import { IToken } from 'src/types/global';

export const calculateLoginWaitingTime = (failedAttempts: number) => {
  if (failedAttempts < 5) {
    return { allowedAttempts: 5, waitingTime: 0 };
  } else if (failedAttempts < 8) {
    return { allowedAttempts: 3, waitingTime: 30 * 60 * 1000 }; // 30 minutes
  } else if (failedAttempts < 11) {
    return { allowedAttempts: 3, waitingTime: 60 * 60 * 1000 }; // 1 hour
  }

  return { allowedAttempts: 3, waitingTime: 3 * 60 * 60 * 1000 }; // 3 hours
};

export const generateToken = (
  data: IToken,
  expiresIn = appConfig.authConfigs.sessionLivespan
): string =>
  jwt.sign(data, appConfig.authConfigs.jwtSecret, {
    expiresIn: expiresIn,
    issuer: `PIF-${appConfig.environment}`,
  });
