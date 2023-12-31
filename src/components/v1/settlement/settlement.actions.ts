import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handlePaginate } from '../../../utils/handlePaginate';
import { handleTimeFilter } from '../../../utils/handleTimeFilter';
import { handleResponse, validateObjectId } from '../../../utils/helpers';
import {
  getCurrencyQuery,
  getMarketplaceQuery,
  getPartnerQuery,
  getProductQuery,
  handleReqSearch,
} from '../../../utils/queryHelpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../utils/queryHelpers/helpers';
import { useWord } from '../../../utils/wordSheet';

import SettlementModel from './settlement.model';
import { SettlementAttributes } from './settlement.types';

export const getSettlements = async (req: IRequest, res: Response) => {
  const {
    marketplace,
    partner_id,
    product_id,
    currency,
    status,
    search_query,
  } = handleReqSearch(req, {
    marketplace: 'string',
    partner_id: 'string',
    product_id: 'string',
    currency: 'string',
    status: 'string',
    search_query: 'string',
  });

  const paginate = handlePaginate(req);
  const timeFilter = handleTimeFilter(req);

  const query: FilterQuery<SettlementAttributes & Document> = {
    ...getMarketplaceQuery(req, marketplace),
    ...(await getPartnerQuery(req, partner_id)),
    ...(await getProductQuery(req, product_id)),
    ...(await getCurrencyQuery(req, currency)),
    ...(status &&
      (status === 'settled' || status === 'pending') && {
        isSettled: status === 'settled',
      }),
  };

  if (timeFilter.$gte || timeFilter.$lte) {
    query.createdAt = timeFilter;
  }

  if (req.sendEmptyData) return handleResponse(res, { data: [] });

  const commonSearchConditions =
    search_query && validateObjectId(search_query)
      ? [
          { _id: search_query },
          { Purchase: search_query },
          { Partner: search_query },
        ]
      : [];

  try {
    const settlements = await SettlementModel.find(
      {
        ...query,
        ...(commonSearchConditions.length && {
          $or: commonSearchConditions,
        }),
      },
      null,
      paginate.queryOptions
    )
      .populate('Product', 'name')
      .populate('Partner', 'name')
      .lean();

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

export const getSettlement = async (req: IRequest, res: Response) => {
  const { settlementId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

  try {
    const settlement = await SettlementModel.findById(settlementId);

    if (!settlement) return handleResponse(res, 'Settlement not found', 404);

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, settlement.marketplace)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    if (
      userType === 'partner-admin' &&
      !hasAccessToPartner(req, settlement.Partner)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    return handleResponse(res, { data: settlement });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
