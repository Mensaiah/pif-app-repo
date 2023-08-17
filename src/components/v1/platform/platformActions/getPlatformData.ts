import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PlatformModel from '../platform.model';

export const getPlatformData = async (req: IRequest, res: Response) => {
  try {
    const platform = await PlatformModel.findOne()
      .sort({
        createdAt: -1,
      })
      .select('-defaultUserTypesAndRoles')
      .lean();

    if (!platform) {
      return handleResponse(
        res,
        'Could not retrieve platform data at this time',
        404
      );
    }

    return handleResponse(res, {
      ...platform,
      marketplaces: platform.marketplaces?.map((marketplace) => {
        delete marketplace.allowPartnersToWithdrawEarning;

        return marketplace;
      }),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
