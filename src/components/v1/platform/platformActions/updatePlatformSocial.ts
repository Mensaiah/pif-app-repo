import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PlatformModel from '../platform.model';
import { updatePlatformSocialSchema } from '../platform.policy';

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
