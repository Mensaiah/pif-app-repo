import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PlatformModel from '../platform.model';
import { updateMarketplaceSchema } from '../platform.policy';

export const updateMarketplace = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof updateMarketplaceSchema>;
  const {
    code,
    name,
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

    if (!marketplaceExists)
      return handleResponse(res, 'Marketplace does not exist', 404);

    if ('name' in req.body) marketplaceExists.name = name;
    if ('currency' in req.body) marketplaceExists.currency = currency;
    if ('currencyCode' in req.body)
      marketplaceExists.currencyCode = currencyCode;
    if ('currencySymbol' in req.body)
      marketplaceExists.currencySymbol = currencySymbol;
    if ('language' in req.body) marketplaceExists.language = language;
    if ('languageCode' in req.body)
      marketplaceExists.languageCode = languageCode;
    if ('paymentProcessors' in req.body)
      marketplaceExists.paymentProcessors = [...new Set(paymentProcessors)];
    if ('socials' in req.body) (marketplaceExists as any).socials = socials;

    if ('allowPartnersToWithdrawEarning' in req.body)
      marketplaceExists.allowPartnersToWithdrawEarning =
        allowPartnersToWithdrawEarning;

    platformData.marketplaces = platformData.marketplaces?.map(
      (marketplace) => {
        if (marketplace.code === code) {
          marketplace = marketplaceExists;
        }
        return marketplace;
      }
    );

    const changesMade = platformData.isModified();

    if (changesMade) {
      await platformData.save();
    }

    const rawPlatformData = platformData.toJSON();
    delete rawPlatformData.defaultUserTypesAndRoles;

    return handleResponse(
      res,
      {
        message: changesMade
          ? 'Marketplace updated successfully'
          : 'No changes were made',
        data: rawPlatformData,
      },
      changesMade ? 200 : 304
    );
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};
