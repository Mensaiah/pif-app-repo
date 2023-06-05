import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { changePasswordSchema } from '../auth.policy';

const doChangePassword = async (req: IRequest, res: Response) => {
  type changePasswordDatatype = z.infer<typeof changePasswordSchema>;

  const { oldPassword, newPassword }: changePasswordDatatype = req.body;

  const userAccess = req.userAccess;
  try {
    if (!userAccess.comparePassword(oldPassword))
      return handleResponse(res, 'Old password is incorrect', 401);

    userAccess.password = newPassword;

    await userAccess.save();

    return handleResponse(res, 'Password changed successfully');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 501, err);
  }
};

export default doChangePassword;
