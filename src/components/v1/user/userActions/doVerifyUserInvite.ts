import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InviteUserModel, UserModel } from '../user.model';
import { verifyInviteSchema } from '../user.policy';

const doVerifyUserInvite = async (req: IRequest, res: Response) => {
  type verifyUserType = z.infer<typeof verifyInviteSchema>;

  const { code }: verifyUserType = req.params;

  try {
    const existingInvite = await InviteUserModel.findOne({
      code,
    });

    if (!existingInvite)
      return handleResponse(res, 'Invite code is invalid', 401);

    const existingUser = await UserModel.findOne({
      email: existingInvite.email,
      userType: existingInvite.role,
    });

    if (existingUser) return handleResponse(res, 'Account already exists', 401);

    if (existingInvite.expiresAt < new Date())
      return handleResponse(res, 'Invite code has expired');

    existingInvite.isConfirmed = true;

    await existingInvite.save();

    return handleResponse(res, {
      message: 'Verification successful',
      data: {
        email: existingInvite.email,
      },
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default doVerifyUserInvite;
