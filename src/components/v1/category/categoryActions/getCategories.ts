import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
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

  const { marketplace, search_query } = handleReqSearch(req, {
    marketplace: 'string',
    search_query: 'string',
  });

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);

  const paginate = handlePaginate(req);

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

  const textQuery: FilterQuery<CategoryAttributes & Document> = {
    ...query,
    ...(search_query && {
      $text: { $search: search_query },
    }),
  };

  const regex = new RegExp('^' + search_query, 'i');

  const regexQuery: FilterQuery<CategoryAttributes & Document> = {
    ...query,
    ...(search_query && {
      'name.value': { $regex: regex },
    }),
  };

  let useRegexSearch = false;

  try {
    let allCategories = await CategoryModel.find(
      textQuery,
      null,
      paginate.queryOptions
    ).lean();

    if (!allCategories.length) {
      useRegexSearch = true;
      allCategories = await CategoryModel.find(
        regexQuery,
        null,
        paginate.queryOptions
      ).lean();
    }

    const count = await CategoryModel.countDocuments(
      useRegexSearch ? regexQuery : textQuery
    );

    return handleResponse(res, {
      data: allCategories,
      meta: paginate.getMeta(count),
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
