import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handlePaginate } from '../../../utils/handlePaginate';
import { handleResponse } from '../../../utils/helpers';
import { handleReqSearch } from '../../../utils/queryHelpers';

import SettlementModel from './settlement.model';
import { SettlementAttributes } from './settlement.types';

export const getSettlements = async (req: IRequest, res: Response) => {
  const { marketplace, partner_id, product_id, currency, status } =
    handleReqSearch(req, {
      marketplace: 'string',
      partner_id: 'string',
      product_id: 'string',
      currency: 'string',
      status: 'string',
    });
  const paginate = handlePaginate(req);
  const query: FilterQuery<SettlementAttributes & Document> = {};

  if (marketplace && marketplace.length === 2) query.marketplace = marketplace;
  if (partner_id) query.Partner = partner_id;
  if (product_id) query.Product = product_id;
  if (currency) query.currency = currency.toLocaleLowerCase();
  if (status && (status === 'settled' || status === 'pending'))
    query.isSettled = status === 'settled';

  try {
    const settlements = await SettlementModel.find(
      query,
      null,
      paginate.queryOptions
    ).lean();

    const count = await SettlementModel.countDocuments(query);

    return handleResponse(res, {
      data: settlements,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(
      res,
      'An error occurred while trying to get settlements',
      500,
      err
    );
  }
};
