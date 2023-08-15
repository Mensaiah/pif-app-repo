import { Response } from 'express';
import { FilterQuery, Document } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleTimeFilter } from '../../../../utils/handleTimeFilter';
import { handleResponse, validateObjectId } from '../../../../utils/helpers';
import {
  getCurrencyQuery,
  getMarketplaceQuery,
  getPartnerQuery,
  getProductQuery,
  getUserQuery,
  handleReqSearch,
} from '../../../../utils/queryHelpers';
import PurchaseModel from '../purchase.model';
import { PurchaseAttributes } from '../purchase.types';

export const getPurchases = async (req: IRequest, res: Response) => {
  const queryParams = handleReqSearch(req, {
    marketplace: 'string',
    partner_id: 'string',
    product_id: 'string',
    user_id: 'string',
    currency: 'string',
    search_query: 'string',
  });

  const paginate = handlePaginate(req);

  const timeFilter = handleTimeFilter(req);

  const query: FilterQuery<PurchaseAttributes & Document> = {
    ...(await getCurrencyQuery(req, queryParams.currency)),
    ...(await getPartnerQuery(req, queryParams.partner_id)),
    ...(await getProductQuery(req, queryParams.product_id)),
    ...(await getUserQuery(req, queryParams.user_id)),
    ...getMarketplaceQuery(req, queryParams.marketplace),
    createdAt: timeFilter,
  };

  if (req.sendEmptyData) return handleResponse(res, { data: [] });

  const commonSearchConditions =
    queryParams.search_query && validateObjectId(queryParams.search_query)
      ? [
          { _id: queryParams.search_query },
          { User: queryParams.search_query },
          { Receiver: queryParams.search_query },
        ]
      : [];

  const textQuery: FilterQuery<PurchaseAttributes & Document> = {
    ...query,
    ...(queryParams.search_query && {
      $text: { $search: queryParams.search_query },
      ...(commonSearchConditions.length && {
        $or: commonSearchConditions,
      }),
    }),
  };

  const regex = new RegExp('^' + queryParams.search_query, 'i');
  const regexQuery: FilterQuery<PurchaseAttributes & Document> = {
    ...query,
    ...(queryParams.search_query && {
      $or: [
        ...commonSearchConditions,
        { senderPifId: { $regex: regex } },
        { recipientPifId: { $regex: regex } },
        { recipientPhoneNumber: { $regex: regex } },
        { 'productName.value': { $regex: regex } },
      ],
    }),
  };

  let usedRegexSearch = false;

  try {
    let purchases = await PurchaseModel.find(
      textQuery,
      null,
      paginate.queryOptions
    )
      .populate('Partner', 'name')
      .lean();

    if (!purchases.length) {
      usedRegexSearch = true;
      purchases = await PurchaseModel.find(
        regexQuery,
        null,
        paginate.queryOptions
      )
        .populate('Partner', 'name')
        .lean();
    }

    const count = await PurchaseModel.countDocuments(
      usedRegexSearch ? regexQuery : textQuery
    );

    return handleResponse(res, {
      data: purchases,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    return handleResponse(
      res,
      'An error occurred while trying to get purchases',
      500,
      err
    );
  }
};
