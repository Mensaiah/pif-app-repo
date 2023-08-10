import { Response } from 'express';
import mongoose from 'mongoose';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { getUserRolesAndPermissions } from '../../auth/authUtils';
import { sendPartnerAdminInviteMail } from '../../notification/notificationUtils';
import PlatformModel from '../../platform/platform.model';
import { filterMarketplaces } from '../../platform/platform.utils';
import { UserModel, UserInviteModel } from '../../user/user.model';
import { createInviteLink } from '../../user/user.utils';
import { PartnerModel } from '../partner.model';
import { addPartnerSchema } from '../partner.policy';

const addPartner = async (req: IRequest, res: Response) => {
  type addPartnerDataType = z.infer<typeof addPartnerSchema>;

  const {
    name,
    email,
    marketplaces,
    vat,
    phonePrefix,
    phone,
    fax,
    website,
    isCharity,
    headquarterCountry,
    headquarterCity,
    headquarterAddress,
    headquarterZipCode,
    bankName,
    bankCountry,
    accountName,
    accountNumber,
    currency,
    isPeriodically,
    periodType,
    isAmountThreshold,
    amountThreshold,
    startProportion,
    finishProportion,
    pifProportion,
    fixedFee,
    enableTransactionFeeManualSettings,
    transactionAmount,
    transactionMaximumAmount,
    redeemType,
    enableRewardSystem,
    status,
    adminEmail,
    adminName,
  }: addPartnerDataType = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingPartner = await PartnerModel.findOne({
      $or: [{ email }, { name }],
    }).session(session);

    if (existingPartner) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Partner already exist.', 409);
    }

    if (marketplaces.includes('all') || headquarterCountry.includes('all')) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'invalid data, please specify marketplace or headquarter country.',
        400
      );
    }

    const platform = await PlatformModel.findOne()
      .sort({ createdAt: -1 })
      .session(session);

    if (!platform) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'Error handling request, please try again later',
        500
      );
    }

    const sanitizedMarketplaces = filterMarketplaces(marketplaces, platform);

    if (!sanitizedMarketplaces.length) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'None of the marketplace(s) supplied exists or is missing',
        404
      );
    }

    const newPartner = new PartnerModel({
      name,
      email,
      marketplaces: sanitizedMarketplaces,
      vat,
      phonePrefix,
      phone,
      fax,
      website,
      isCharity,
      redeemType,
      enableRewardSystem,
      status,
      headquarter: {
        address: headquarterAddress,
        city: headquarterCity,
        country: headquarterCountry,
        zipCode: headquarterZipCode,
      },
      paymentDetails: {
        accountName,
        accountNumber,
        bankName,
        country: bankCountry,
        currency,
      },
      settlingDetails: {
        startProportion,
        finishProportion,
        fixedFee,
        pifProportion,
      },
      rolesAndPermissions: getUserRolesAndPermissions(
        'partner-admin',
        platform
      ),
    });

    if (isPeriodically) {
      newPartner.settlingDetails.isPeriodically = isPeriodically;
      newPartner.settlingDetails.periodType = periodType;
    }

    if (isAmountThreshold) {
      newPartner.settlingDetails.isAmountThreshold = isAmountThreshold;
      newPartner.settlingDetails.amountThreshold = amountThreshold;
    }

    if (enableTransactionFeeManualSettings) {
      newPartner.settlingDetails.enableTransactionFeeManualSettings =
        enableTransactionFeeManualSettings;
      newPartner.settlingDetails.transactionAmount = transactionAmount;
      newPartner.settlingDetails.transactionMaximumAmount =
        transactionMaximumAmount;
    }

    if (adminEmail && adminName) {
      const existingAdminPartner = await UserModel.findOne({
        userType: { $ne: 'customer' },
        email: adminEmail,
      }).session(session);

      if (existingAdminPartner) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(
          res,
          "The user you're trying to make admin for this new Partner already exists on the platform",
          409
        );
      }

      const newInvite = await new UserInviteModel({
        email: adminEmail,
        code: uuid(),
        role: 'partner-admin',
        Partner: newPartner._id,
        userType: 'partner-admin',
        invitedBy: req.user._id,
        expiresAt: new Date(Date.now() + ms('1 day')),
        lastSent: new Date(),
        status: 'pending',
      }).save({ session });

      await sendPartnerAdminInviteMail({
        to: adminEmail,
        url: createInviteLink(req, newInvite.code),
        adminName,
        partnerName: name,
      });
    }

    // TODO: push notification

    await newPartner.save({ session });

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, {
      message:
        adminEmail && adminName
          ? 'Partner added and invitation sent successfully'
          : 'Partner added successfully',
      data: newPartner,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default addPartner;
