import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import { CategoryModel } from '../category.model';
import { CategoryAttributes } from '../category.types';

const getCategoryByMarketplace = async (req: IRequest, res: Response) => {
  const { marketplace } = req.params;

  const { search_query } = handleReqSearch(req, {
    search_query: 'string',
  });

  if (marketplace.length !== 2)
    return handleResponse(res, 'invalid marketplace', 400);

  const query: FilterQuery<CategoryAttributes & Document> = {
    isEnabled: true,
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    marketplaces: { $in: [marketplace] },
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

  try {
    let allCategories = await CategoryModel.find(
      textQuery,
      'name Icon iconName iconUrl'
    );

    if (!allCategories.length) {
      allCategories = await CategoryModel.find(regexQuery, 'name Icon');
    }

    return handleResponse(res, {
      data: allCategories,
    });
  } catch (err) {
    handleResponse(res, 'error fetching categories', 500, err);
  }
};

export default getCategoryByMarketplace;
