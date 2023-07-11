import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { setPinSchema } from '../auth.policy';

const doSetPin = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof setPinSchema>;

  const { pin }: dataType = req.body;
  const userAccess = req.userAccess;

  if (userAccess.pin) return handleResponse(res, 'Pin is already set', 401);

  userAccess.updatePin(pin);
  try {
    await userAccess.save();

    return handleResponse(res, 'Operation successful');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default doSetPin;
