import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import { CategoryModel } from '../category.model';
import { CategoryAttributes } from '../category.types';

const getCategoryByMarketplace = async (req: IRequest, res: Response) => {
  const { userType } = req;

  const { marketplace } = req.params;

  const { search_query } = handleReqSearch(req, {
    search_query: 'string',
  });

  if (!marketplace && marketplace.length !== 2)
    return handleResponse(res, 'invalid marketplace', 400);

  const paginate = handlePaginate(req);

  const query: FilterQuery<CategoryAttributes & Document> =
    userType === 'platform-admin'
      ? { marketplaces: { $in: [marketplace] } }
      : {
          isEnabled: true,
          deletedAt: { $exists: false },
          marketplaces: { $in: [marketplace] },
        };

  const textQuery: FilterQuery<CategoryAttributes & Document> = {
    ...query,
    ...(search_query && {
      $text: { $search: search_query },
    }),
  };

  let useRegexSearch = false;

  const regex = new RegExp('^' + search_query, 'i');

  const regexQuery: FilterQuery<CategoryAttributes & Document> = {
    ...query,
    ...(search_query && {
      'name.value': { $regex: regex },
    }),
  };

  try {
    let allCategories = await CategoryModel.find(
      textQuery,
      'name Icon',
      paginate.queryOptions
    );

    if (!allCategories.length) {
      useRegexSearch = true;

      allCategories = await CategoryModel.find(
        regexQuery,
        'name Icon',
        paginate.queryOptions
      );
    }

    const count = await CategoryModel.countDocuments(
      useRegexSearch ? regexQuery : textQuery
    );

    return handleResponse(res, {
      data: allCategories,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(res, 'error fetching categories', 500, err);
  }
};

export default getCategoryByMarketplace;
