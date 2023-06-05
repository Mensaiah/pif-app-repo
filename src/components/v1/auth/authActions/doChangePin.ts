import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { changePinSchema } from '../auth.policy';

const doChangePin = async (req: IRequest, res: Response) => {
  type changePinDatatype = z.infer<typeof changePinSchema>;

  const { oldPin, newPin }: changePinDatatype = req.body;

  const userAccess = req.userAccess;
  try {
    if (!userAccess.comparePin(oldPin))
      return handleResponse(res, 'Old Pin is incorrect.', 401);

    userAccess.pin = newPin;

    await userAccess.save();

    return handleResponse(res, 'Pin changed successfully');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 501, err);
  }
};

export default doChangePin;
