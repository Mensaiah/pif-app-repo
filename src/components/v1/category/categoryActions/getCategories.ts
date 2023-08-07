import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  handleReqSearch,
  getMarketplaceQuery,
} from '../../../../utils/queryHelpers';
import { useWord } from '../../../../utils/wordSheet';
import { CategoryModel } from '../category.model';
import { CategoryAttributes } from '../category.types';

const getCategories = async (req: IRequest, res: Response) => {
  const { userType } = req;

  const { marketplace } = handleReqSearch(req, { marketplace: 'string' });

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);

  const query: FilterQuery<CategoryAttributes & Document> = {
    ...(userType !== 'platform-admin' && {
      isEnabled: true,
      deletedAt: { $exists: false },
    }),
    $and: [
      { 'marketplaces.0': { $exists: true } },
      {
        ...(marketplaceQuery.marketplace && {
          marketplaces: marketplaceQuery.marketplace,
        }),
      },
    ],
  };

  try {
    const categories = await CategoryModel.find(query).lean();

    return handleResponse(res, {
      data: categories,
    });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default getCategories;
