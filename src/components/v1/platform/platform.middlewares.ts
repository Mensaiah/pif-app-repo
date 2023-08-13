import bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';

import appConfig from '../../../config';
import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';

export const verifyExternalCronMiddleware = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const cronKey = req.headers['x-cron-key'];

  const { externalCronKey, authConfigs } = appConfig;

  if (!bcrypt.compareSync(cronKey + authConfigs.hashPepper, externalCronKey)) {
    return handleResponse(res, 'Invalid cron key', 401);
  }

  next();
};
