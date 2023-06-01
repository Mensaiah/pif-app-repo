import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';

import PlatformModel from './platform.model';
import {
  addMarketplaceSchema,
  addPlatformSocialSchema,
  updateMarketplaceSchema,
  updatePlatformSocialSchema,
} from './platform.policy';

export const getPlatformData = async (req: IRequest, res: Response) => {
  try {
    const platform = await PlatformModel.findOne().sort({
      createdAt: -1,
    });
    return handleResponse(res, platform);
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const addMarketplace = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addMarketplaceSchema>;

  const {
    name,
    code,
    currency,
    currencyCode,
    language,
    languageCode,
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
      currencyCode,
      language,
      languageCode,
    });

    await platformData.save();

    return handleResponse(res, {
      message: 'Marketplace added successfully',
      data: platformData,
    });
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};

export const updateMarketplace = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof updateMarketplaceSchema>;
  const {
    code,
    name,
    currency,
    currencyCode,
    language,
    languageCode,
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

    if (name) marketplaceExists.name = name;
    if (currency) marketplaceExists.currency = currency;
    if (currencyCode) marketplaceExists.currencyCode = currencyCode;
    if (language) marketplaceExists.language = language;
    if (languageCode) marketplaceExists.languageCode = languageCode;

    platformData.marketplaces = platformData.marketplaces?.map(
      (marketplace) => {
        if (marketplace.code === code) {
          marketplace = marketplaceExists;
        }
        return marketplace;
      }
    );

    const changesMade =
      name || currency || currencyCode || language || languageCode;

    if (changesMade) {
      await platformData.save();
    }

    return handleResponse(
      res,
      {
        message: changesMade
          ? 'Marketplace updated successfully'
          : 'No changes were made',
        data: platformData,
      },
      changesMade ? 200 : 304
    );
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
  // get platform data from db
  // update marketplace in platform
  // save platform
  // return platform
};

export const addPlatformSocial = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addPlatformSocialSchema>;

  const { name, url }: dataType = req.body;

  try {
    const platformData = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platformData) {
      return handleResponse(res, 'Error handling request at this time', 500);
    }

    const socialExists = platformData.socials?.find(
      (social) => social.name === name
    );

    if (socialExists) return handleResponse(res, 'Social already exists', 409);

    platformData.socials?.push({
      name,
      url,
    });

    await platformData.save();

    return handleResponse(res, platformData);
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};

export const updatePlatformSocial = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof updatePlatformSocialSchema>;

  const { name, url }: dataType = req.body;

  try {
    const platformData = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platformData)
      return handleResponse(res, 'Error handling request at this time', 500);

    const socialExists = platformData.socials?.find(
      (social) => social.name === name
    );

    if (!socialExists)
      return handleResponse(res, 'Social media data does not exist', 404);

    socialExists.url = url;

    platformData.socials = platformData.socials?.map((social) => {
      if (social.name === name) {
        social = socialExists;
      }
      return social;
    });

    return handleResponse(res, platformData);
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};
