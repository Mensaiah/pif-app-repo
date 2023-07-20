import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserInviteModel } from '../user.model';
import { verifyPlatformInviteSchema } from '../user.policy';

const verifyPlatformInvite = async (req: IRequest, res: Response) => {
  type verifyUserType = z.infer<typeof verifyPlatformInviteSchema>;

  const { code }: verifyUserType = req.params;

  try {
    const existingInvite = await UserInviteModel.findOne({
      code,
    });

    if (!existingInvite)
      return handleResponse(res, 'Invite code is invalid', 401);

    if (existingInvite.expiresAt < new Date())
      return handleResponse(res, 'Invitation code has expire');

    if (existingInvite.status === 'accepted')
      return handleResponse(
        res,
        'Invitation code has been accepted already, kindly proceed to onboarding.'
      );

    existingInvite.status = 'accepted';

    await existingInvite.save();

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
