import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, consoleLog } from '../../../../utils/helpers';
import { uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { sendVerificationMail } from '../../auth/auth.utils';
import { InviteUserModel, UserModel } from '../user.model';
import { inviteUserSchema } from '../user.policy';

const doInviteUser = async (req: IRequest, res: Response) => {
  type inviteUserType = z.infer<typeof inviteUserSchema>;

  const { _id } = req.user;
  const { email, role, marketplace, partnerId }: inviteUserType = req.body;

  try {
    const existingUser = await UserModel.findOne(
      partnerId
        ? { email, userType: role, Partner: partnerId }
        : { email, userType: role }
    );

    if (existingUser)
      return handleResponse(res, 'Account already exists.', 409);

    const newInviteCode = await new InviteUserModel({
      code: uuid(),
      email,
      role,
      invitedBy: _id,
      currentMarketplace: marketplace,
      Partner: partnerId,
      expiresAt: new Date(Date.now() + ms('30 mins')),
      lastSent: new Date(),
    }).save();

    const verificationLink = `${req.protocol}://${req.get('host')}${
      req.baseUrl
    }/invitation/${newInviteCode.code}`;

    await sendVerificationMail({
      to: email,
      url: verificationLink,
    });

    consoleLog(verificationLink);
    return handleResponse(res, verificationLink);
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default doInviteUser;
