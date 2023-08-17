import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PlatformModel from '../platform.model';
import { addMarketplaceSchema } from '../platform.policy';

export const addMarketplace = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addMarketplaceSchema>;

  const {
    name,
    code,
    currency,
    currencyCode,
    currencySymbol,
    language,
    languageCode,
    paymentProcessors,
    socials,
    allowPartnersToWithdrawEarning,
  }: dataType = req.body;

  try {
    const platformData = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platformData)
      return handleResponse(res, 'Error handling request at this time', 500);

    const marketplaceExists = platformData.marketplaces?.find(
      (marketplace) => marketplace.code === code
    );

    if (marketplaceExists) {
      return handleResponse(res, 'Marketplace already exists', 409);
    }

    platformData.marketplaces?.push({
      name,
      code,
      currency,
      currencySymbol,
      currencyCode,
      language,
      languageCode,
      paymentProcessors: paymentProcessors as any,
      socials: socials as any,
      allowPartnersToWithdrawEarning,
    });

    await platformData.save();

    const rawPlatformData = platformData.toJSON();
    delete rawPlatformData.defaultUserTypesAndRoles;

    return handleResponse(res, {
      message: 'Marketplace added successfully',
      data: rawPlatformData,
    });
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};
