import { Response } from 'express';
import mongoose from 'mongoose';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { sendPartnerAdminInviteMail } from '../../notification/notificationUtils';
import { PartnerPosAttributes } from '../../partnerPos/partnerPos.types';
import { PartnerPosModel } from '../../partnerPos/partnerPost.model';
import { UserModel, UserInviteModel } from '../../user/user.model';
import { createInviteLink } from '../../user/user.utils';
import { PartnerModel } from '../partner.model';
import { partnerInviteSchema } from '../partner.policy';

const addPartnerAdmins = async (req: IRequest, res: Response) => {
  const { partnerId } = req.params;

  const { isUserTopLevelAdmin, userType, user } = req;

  type partnerInviteType = z.infer<typeof partnerInviteSchema>;

  const session = await mongoose.startSession();
  session.startTransaction();

  const {
    adminEmail,
    adminName,
    role,
    userType: partnerUserType,
    posId,
  }: partnerInviteType = req.body;

  try {
    // check if usertype is platform admin else if partner admin, check if it has access to the Partner

    const partner = await PartnerModel.findById(partnerId).session(session);

    if (!partner) {
      await session.commitTransaction();
      session.endSession();

      return handleResponse(res, 'Partner not found', 404);
    }

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, partner.marketplaces)
    ) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );
    }

    if (userType === 'partner-admin' && !hasAccessToPartner(req, partner._id)) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );
    }

    let pos: undefined | (PartnerPosAttributes & Document);

    const isLocalPartnerInvite = role === 'local-partner' && posId;

    if (isLocalPartnerInvite) {
      pos = await PartnerPosModel.findById(posId);

      if (!pos) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(res, 'Invalid posId', 400);
      }
    }

    const existingPartnerAdmin = await UserModel.findOne({
      userType: 'partner-admin',
      email: adminEmail,
    }).session(session);

    if (existingPartnerAdmin) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Partner already exist', 409);
    }

    const existingInvite = await UserInviteModel.findOne({
      email: adminEmail,
      role,
    }).session(session);

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

      await existingInvite.save({ session });

      await session.commitTransaction();
      session.endSession();

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

    await newInvite.save({ session });

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, 'Invitation sent ✉️');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default addPartnerAdmins;
