import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { sendPartnerAdminInviteMail } from '../../auth/auth.utils';
import { PartnerPosAttributes } from '../../partnerPos/partnerPos.types';
import { PartnerPosModel } from '../../partnerPos/partnerPost.model';
import { UserModel, UserInviteModel } from '../../user/user.model';
import { createInviteLink } from '../../user/user.utils';
import { PartnerModel } from '../partner.model';
import { partnerInviteSchema } from '../partner.policy';
import { checkPartnerAccess } from '../partner.utils';

const addPartnerAdmins = async (req: IRequest, res: Response) => {
  const { partnerId } = req.params;

  const { user } = req;

  type partnerInviteType = z.infer<typeof partnerInviteSchema>;

  const {
    adminEmail,
    adminName,
    role,
    userType: partnerUserType,
    posId,
  }: partnerInviteType = req.body;

  try {
    // check if usertype is platform admin else if partner admin, check if it has access to the Partner

    const partner = await PartnerModel.findById(partnerId);

    const isSupportedUser = checkPartnerAccess(req, partner);

    if (!isSupportedUser) {
      return handleResponse(
        res,
        'You are not authorized to perform this action.',
        403
      );
    }

    let pos: undefined | (PartnerPosAttributes & Document);

    const isLocalPartnerInvite = role === 'local-partner' && posId;

    if (isLocalPartnerInvite) {
      pos = await PartnerPosModel.findById(posId);
    }

    const existingPartnerAdmin = await UserModel.findOne({
      userType: { $ne: 'customer' },
      email: adminEmail,
    });

    if (existingPartnerAdmin)
      return handleResponse(res, 'Partner already exist', 409);

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
        partnerName: isLocalPartnerInvite ? pos.name : partner.name,
      });

      await existingInvite.save();

      return handleResponse(
        res,
        'Partner has already been invited but another email has been sent'
      );
    }

    const newInvite = new UserInviteModel({
      email: adminEmail,
      code: uuid(),
      role,
      userType: partnerUserType,
      invitedBy: user._id,
      expiresAt: new Date(Date.now() + ms('1 day')),
      lastSent: new Date(),
      status: 'pending',
      marketplaces: partner.marketplaces,
    });

    if (isLocalPartnerInvite) {
      newInvite.PartnerPos = pos._id;
    } else {
      newInvite.Partner = partner._id;
    }

    await sendPartnerAdminInviteMail({
      to: adminEmail,
      url: createInviteLink(req, newInvite.code),
      adminName,
      partnerName: isLocalPartnerInvite ? pos.name : partner.name,
    });

    await newInvite.save();

    return handleResponse(res, 'Invitation sent ✉️');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default addPartnerAdmins;
