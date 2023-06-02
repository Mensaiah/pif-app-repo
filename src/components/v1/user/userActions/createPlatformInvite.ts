import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { sendVerificationMail } from '../../auth/auth.utils';
import { UserInviteModel, UserModel } from '../user.model';
import { createPlatformInviteSchema } from '../user.policy';

const createInviteLink = (req: IRequest, code: string) =>
  `${req.protocol}://${req.get('host')}${req.baseUrl}/invitation/${code}`;

const createPlatformInvite = async (req: IRequest, res: Response) => {
  type UserInviteType = z.infer<typeof createPlatformInviteSchema>;

  const { email, role, marketplace, partnerId }: UserInviteType = req.body;

  try {
    const existingUser = await UserModel.findOne(
      partnerId
        ? { email, userType: { $ne: 'customer' }, Partner: partnerId }
        : { email, userType: { $ne: 'customer' } }
    );

    if (existingUser)
      return handleResponse(res, 'Account already exists.', 409);

    const invitationData = await UserInviteModel.findOne({ email });

    if (invitationData) {
      if (invitationData.expiresAt < new Date()) {
        invitationData.code = uuid();
      }

      await sendVerificationMail({
        to: email,
        url: createInviteLink(req, invitationData.code),
        role,
      });

      await invitationData.save();
      return handleResponse(
        res,
        'User has already been invited but another email has been sent'
      );
    }

    const newInvite = await new UserInviteModel({
      code: uuid(),
      email,
      role,
      invitedBy: req.user._id,
      currentMarketplace: marketplace,
      Partner: partnerId,
      expiresAt: new Date(Date.now() + ms('1 day')),
      lastSent: new Date(),
    }).save();

    await sendVerificationMail({
      to: email,
      url: createInviteLink(req, newInvite.code),
      role,
    });

    return handleResponse(res, 'Invite sent ✉️');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default createPlatformInvite;
