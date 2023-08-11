import { Response } from 'express';
import { FilterQuery, Document } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handlePaginate } from '../../../utils/handlePaginate';
import { handleResponse } from '../../../utils/helpers';
import {
  getCurrencyQuery,
  getMarketplaceQuery,
  getPartnerQuery,
  getProductQuery,
  getUserQuery,
  handleReqSearch,
} from '../../../utils/queryHelpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../utils/queryHelpers/helpers';
import { useWord } from '../../../utils/wordSheet';

import PurchaseModel from './purchase.model';
import { PurchaseAttributes } from './purchase.types';

export const getPurchases = async (req: IRequest, res: Response) => {
  const { marketplace, partner_id, product_id, user_id, currency } =
    handleReqSearch(req, {
      marketplace: 'string',
      partner_id: 'string',
      product_id: 'string',
      user_id: 'string',
      currency: 'string',
    });
  const paginate = handlePaginate(req);

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);
  const partnerQuery = await getPartnerQuery(req, partner_id);
  const productQuery = await getProductQuery(req, product_id);
  const userQuery = await getUserQuery(req, user_id);
  const currencyQuery = await getCurrencyQuery(req, currency);
  if (req.sendEmptyData) return handleResponse(res, { data: [] });

  const query: FilterQuery<PurchaseAttributes & Document> = {
    ...currencyQuery,
    ...partnerQuery,
    ...productQuery,
    ...userQuery,
    ...marketplaceQuery,
  };

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
export const getPurchase = async (req: IRequest, res: Response) => {
  const { purchaseId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;
  try {
    const purchase = await PurchaseModel.findById(purchaseId)
      .populate('SettlementStart')
      .populate('SettlementFinish')
      .populate('Partner', 'name');

    if (!purchase) return handleResponse(res, 'Purchase not found', 404);

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, purchase.marketplace)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    if (
      userType === 'partner-admin' &&
      !hasAccessToPartner(req, purchase.Partner)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    return handleResponse(res, { data: purchase });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
