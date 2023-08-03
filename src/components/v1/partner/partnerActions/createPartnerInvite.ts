import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { sendPartnerAdminInviteMail } from '../../auth/auth.utils';
import { UserModel, UserInviteModel } from '../../user/user.model';
import { createInviteLink } from '../../user/user.utils';
import { PartnerModel } from '../partner.model';
import { partnerInviteSchema } from '../partner.policy';

const createPartnerInvite = async (req: IRequest, res: Response) => {
  type partnerInviteType = z.infer<typeof partnerInviteSchema>;

  const {
    adminEmail,
    adminName,
    partnerId,
    role,
    userType,
  }: partnerInviteType = req.body;

  try {
    const existingPartner = await UserModel.findOne({
      userType: { $ne: 'customer' },
      email: adminEmail,
    });

    if (existingPartner)
      return handleResponse(res, 'Partner already exists', 409);

    const partner = await PartnerModel.findById(partnerId);

    const existingInvite = await UserInviteModel.findOne({
      email: adminEmail,
      role,
    });

    if (existingInvite) {
      if (existingInvite.expiresAt < new Date()) {
        existingInvite.code = uuid();
      }

      await sendPartnerAdminInviteMail({
        to: adminEmail,
        url: createInviteLink(req, existingInvite.code),
        adminName,
        partnerName: partner.name,
      });

      await existingInvite.save();

      return handleResponse(
        res,
        'Partner has already been invited but another email has been sent'
      );
    }

    const newInvite = await new UserInviteModel({
      email: adminEmail,
      code: uuid(),
      role,
      userType,
      invitedBy: req.user._id,
      Partner: partnerId,
      expiresAt: new Date(Date.now() + ms('1 day')),
      lastSent: new Date(),
      status: 'pending',
      marketplaces: partner.marketplaces,
    }).save();

    await sendPartnerAdminInviteMail({
      to: adminEmail,
      url: createInviteLink(req, newInvite.code),
      adminName,
      partnerName: partner.name,
    });

    return handleResponse(res, 'Invitation sent ✉️');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default createPartnerInvite;
