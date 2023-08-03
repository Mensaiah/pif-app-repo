import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PlatformModel from '../../platform/platform.model';
import { filterMarketplaces } from '../../platform/platform.utils';
import { PartnerModel } from '../partner.model';
import { updatePartnerSchema } from '../partner.policy';

const updatePartner = async (req: IRequest, res: Response) => {
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

export default updatePartner;
