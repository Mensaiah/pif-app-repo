import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../types/global';
import {
  _omit,
  consoleLog,
  handleResponse,
  uuid,
} from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';
import {
  getUserRolesAndPermissions,
  sendPartnerAdminInviteMail,
} from '../auth/auth.utils';
import PlatformModel from '../platform/platform.model';
import { filterMarketplaces } from '../platform/platform.utils';
import { UserInviteModel, UserModel } from '../user/user.model';
import { createInviteLink } from '../user/user.utils';

import { PartnerModel } from './partner.model';
import {
  addPartnerSchema,
  partnerInviteSchema,
  updatePartnerSchema,
} from './partner.policy';

export const addPartner = async (req: IRequest, res: Response) => {
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
  try {
    const existingPartner = await PartnerModel.findOne({
      $or: [{ email }, { name }],
    });

    if (existingPartner)
      return handleResponse(res, 'Partner already exist.', 409);

    if (marketplaces.includes('all') || headquarterCountry.includes('all'))
      return handleResponse(
        res,
        'invalid data, please specify marketplace or headquarter country.',
        400
      );

    const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platform)
      return handleResponse(
        res,
        'Error handling request, please try again later',
        500
      );

    const sanitizedMarketplaces = filterMarketplaces(marketplaces, platform);

    if (!sanitizedMarketplaces.length)
      return handleResponse(
        res,
        'None of the marketplace(s) supplied exists or is missing',
        404
      );

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
      });

      if (existingAdminPartner) {
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
      }).save();

      await sendPartnerAdminInviteMail({
        to: adminEmail,
        url: createInviteLink(req, newInvite.code),
        adminName,
        partnerName: name,
      });
    }

    // TODO: push notification

    await newPartner.save();

    return handleResponse(res, {
      message:
        adminEmail && adminName
          ? 'Partner added and invitation sent successfully'
          : 'Partner added successfully',
      data: newPartner,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const getPartners = async (req: IRequest, res: Response) => {
  let { marketplace } = req.params;

  if (marketplace) {
    if (marketplace === 'all') marketplace = '';
    if (marketplace.length > 2) {
      const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

      if (platform) {
        marketplace =
          platform.marketplaces.find((m) => m.name === marketplace)?.code ||
          marketplace;
      }
    }

    marketplace = marketplace.toLocaleLowerCase();
  }

  try {
    const partners = await (marketplace
      ? PartnerModel.find(
          {
            marketplaces: { $elemMatch: { $eq: marketplace } },
          },
          '-rolesAndPermissions'
        )
      : PartnerModel.find({}, '-rolesAndPermissions'));

    return handleResponse(res, {
      data: partners,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const getSinglePartner = async (req: IRequest, res: Response) => {
  const { partnerId } = req.params;

  try {
    const partner = await PartnerModel.findById(partnerId);

    if (!partner) return handleResponse(res, 'Partner does not exist', 404);

    return handleResponse(res, {
      data: _omit(partner.toObject(), [
        'rolesAndPermissions',
        'contractDocuments',
      ]),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const updatePartner = async (req: IRequest, res: Response) => {
  const { partnerId } = req.params;

  type updatePartnerDataType = z.infer<typeof updatePartnerSchema>;

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
  }: updatePartnerDataType = req.body;
  try {
    if (marketplaces.includes('all') || headquarterCountry.includes('all'))
      return handleResponse(
        res,
        'invalid data, please specify marketplace or headquarter country.',
        400
      );

    const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

    const sanitizedMarketplaces = filterMarketplaces(marketplaces, platform);

    if (!sanitizedMarketplaces.length)
      return handleResponse(
        res,
        'None of the marketplace(s) supplied exists or is missing',
        404
      );

    const updatedPartner = await PartnerModel.findOneAndUpdate(
      {
        _id: partnerId,
      },
      {
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
          currency,
        },
        paymentDetails: {
          accountName,
          accountNumber,
          bankName,
          bankCountry,
        },
        settlingDetails: {
          startProportion,
          finishProportion,
          fixedFee,
          pifProportion,
          isPeriodically,
          periodType,
          isAmountThreshold,
          amountThreshold,
          enableTransactionFeeManualSettings,
          transactionAmount,
          transactionMaximumAmount,
        },
      },
      { new: true }
    );

    if (!updatedPartner)
      return handleResponse(res, 'error locating Partner', 404);

    return handleResponse(res, {
      message: 'Partner updated successfully',
      data: updatedPartner,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const createPartnerInvite = async (req: IRequest, res: Response) => {
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

export const getPartnersByCategoryAndMarketplace = async (
  req: IRequest,
  res: Response
) => {
  const { categoryId, marketplace } = req.params;
  consoleLog(JSON.stringify({ categoryId, marketplace }, null, 2));

  try {
    const partners = await PartnerModel.find(
      {
        marketplaces: { $in: [marketplace] },
        productCategories: { $in: [categoryId] },
        status: 'active',
      },
      'name logo logoCropData headquarter'
    );

    return handleResponse(res, {
      data: partners,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
