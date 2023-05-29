import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InviteUserModel } from '../user.model';
import { verifyPlatformInviteSchema } from '../user.policy';

const verifyPlatformInvite = async (req: IRequest, res: Response) => {
  type verifyUserType = z.infer<typeof verifyPlatformInviteSchema>;

  const { code }: verifyUserType = req.params;

  try {
    const existingInvite = await InviteUserModel.findOne({
      code,
    });

    if (!existingInvite)
      return handleResponse(res, 'Invite code is invalid', 401);

    if (existingInvite.expiresAt < new Date())
      return handleResponse(res, 'Invitation code has expired');

    // TODO: send verification OTP code to invited user

    return handleResponse(res, {
      message: 'Proceed to onboarding',
      data: {
        email: existingInvite.email,
      },
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default verifyPlatformInvite;
