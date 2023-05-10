import { IRequest } from 'src/types/global';
import { setPinSchema } from '../auth.policy';
import { handleResponse } from 'src/utils/helpers';
import { Response } from 'express';
import { z } from 'zod';
import { useWord } from 'src/utils/wordSheet';

const doSetPin = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof setPinSchema>;

  const { pin }: dataType = req.body;
  const userAccess = req.userAccess;

  if (userAccess.pin) return handleResponse(res, 'Pin is already set', 401);

  userAccess.pin = pin;
  try {
    await userAccess.save();

    return handleResponse(res, 'Operation successful');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default doSetPin;
