import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import appConfig from '../../../../config';
import { handleResponse, uuid } from '../../../../utils/helpers';

export const generateKeyHashPair = async (req: Request, res: Response) => {
  const key = uuid();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(key + appConfig.authConfigs.hashPepper, salt);

  return handleResponse(res, {
    key,
    hash,
  });
};

export const pifBiHourlyTasks = async (req: Request, res: Response) => {
  return handleResponse(res, {
    message: 'On it!, thank you 🤗',
  });
};
