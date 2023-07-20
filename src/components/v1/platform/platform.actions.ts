import { Response } from 'express';
import { z } from 'zod';

import appConfig from '../../../config';
import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';
import { OtpCodeModel, UserAccessModel } from '../auth/auth.models';
import { UserInviteModel, UserModel } from '../user/user.model';

import PlatformModel from './platform.model';
import {
  addMarketplaceSchema,
  addPlatformSocialSchema,
  updateMarketplaceSchema,
  updatePlatformSocialSchema,
} from './platform.policy';

export const getPlatformData = async (req: IRequest, res: Response) => {
  try {
    const platform = await PlatformModel.findOne()
      .sort({
        createdAt: -1,
      })
      .select('-defaultUserTypesAndRoles');

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
    currencySymbol,
    language,
    languageCode,
    paymentProcessors,
    socials,
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

    const rawPlatformData = platformData.toJSON();
    delete rawPlatformData.defaultUserTypesAndRoles;

    return handleResponse(res, rawPlatformData);
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

    const rawPlatformData = platformData.toJSON();
    delete rawPlatformData.defaultUserTypesAndRoles;

    return handleResponse(res, rawPlatformData);
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};

export const clearDBonDev = async (req: IRequest, res: Response) => {
  if (!appConfig.isDev) return handleResponse(res, 'Not allowed', 403);

  // clear all models in the db, send success to the client and restart server to prompt seeder to run
  try {
    await PlatformModel.deleteMany();
    await UserModel.deleteMany();
    await UserAccessModel.deleteMany();
    await UserInviteModel.deleteMany();
    await OtpCodeModel.deleteMany();

    handleResponse(res, 'DB cleared successfully');

    process.exit(0);
  } catch (err) {
    return handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};
