import { Response } from 'express';
import { FilterQuery, Document } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handlePaginate } from '../../../utils/handlePaginate';
import { handleReqSearch } from '../../../utils/handleReqSearch';
import { handleResponse } from '../../../utils/helpers';

import PurchaseModel from './purchase.model';
import { PurchaseAttributes } from './purchase.types';

export const getPurchases = async (req: IRequest, res: Response) => {
  const { userAccess, userType, role } = req;
  const { marketplace, partner_id, product_id, user_id, currency } =
    handleReqSearch(req, {
      marketplace: 'string',
      partner_id: 'string',
      product_id: 'string',
      user_id: 'string',
      currency: 'string',
    });
  const paginate = handlePaginate(req);
  const query: FilterQuery<PurchaseAttributes & Document> = {};

  if (marketplace && marketplace.length === 2) query.marketplace = marketplace;
  // TODO: ensure the user is allowed to query that marketplace
  // check userAccess in req and also check role

  if (partner_id) query.Partner = partner_id;
  // TODO: ensure the user is allowed to query that partner

  if (product_id) query.Product = product_id;
  // TODO: ensure the user is allowed to view that product

  if (user_id) {
    if (userType === 'partner-admin')
      return handleResponse(
        res,
        'You are not allowed to perform this operation',
        403
      );
    query.User = user_id;
  }
  // TODO: only an admin can use this query and ensure the user is in the same marketplace as the admin

  if (currency) query.currency = currency;

  try {
    const purchases = await PurchaseModel.find(
      query,
      null,
      paginate.queryOptions
    )
      .populate('Partner', 'name')
      .lean();

    const count = await PurchaseModel.countDocuments(query);

    return handleResponse(res, {
      data: purchases,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(
      res,
      'An error occurred while trying to get purchases',
      500,
      err
    );
    throw err;
  }
};

// TODO: ensure the user is allowed to view that purchase
// export const getPurchase = async (req: IRequest, res: Response) => {};
