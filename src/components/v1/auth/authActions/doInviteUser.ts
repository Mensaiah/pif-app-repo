import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { inviteUserSchema } from '../auth.policy';

const doInviteUser = async (req: IRequest, res: Response) => {
  type inviteUserType = z.infer<typeof inviteUserSchema>;

  const { email, role, marketplace, partnerId }: inviteUserType = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (['admin', 'country admin'].includes(role)) {
      if (role === 'country admin') {
      }
    }

    if (['partner admin', 'local partner'].includes(role)) {
    }
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default doInviteUser;
