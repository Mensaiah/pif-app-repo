import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handlePaginate } from '../../../utils/handlePaginate';
import { handleResponse } from '../../../utils/helpers';
import { handleReqSearch } from '../../../utils/queryHelpers';

import RevenueModel from './revenue.model';
import { RevenueAttributes } from './revenue.types';

export const getRevenueList = async (req: IRequest, res: Response) => {
  const { marketplace, partner_id, product_id, currency } = handleReqSearch(
    req,
    {
      marketplace: 'string',
      partner_id: 'string',
      product_id: 'string',
      currency: 'string',
    }
  );
  const paginate = handlePaginate(req);
  const query: FilterQuery<RevenueAttributes & Document> = {};

  if (marketplace && marketplace.length === 2) query.marketplace = marketplace;
  if (partner_id) query.Partner = partner_id;
  if (product_id) query.Product = product_id;
  if (currency) query.currency = currency.toLocaleLowerCase();

  try {
    const revenueList = await RevenueModel.find(
      query,
      null,
      paginate.queryOptions
    )
      .populate('Product', 'name')
      .populate('Partner', 'name')
      .lean();

    const count = await RevenueModel.countDocuments(query);

    return handleResponse(res, {
      data: revenueList,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(
      res,
      'An error occurred while trying to get income list',
      500,
      err
    );
  }
};
