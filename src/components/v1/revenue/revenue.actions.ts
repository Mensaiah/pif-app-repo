import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handlePaginate } from '../../../utils/handlePaginate';
import { handleTimeFilter } from '../../../utils/handleTimeFilter';
import { handleResponse } from '../../../utils/helpers';
import {
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
  const timeFilter = handleTimeFilter(req);

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);
  const partnerQuery = await getPartnerQuery(req, partner_id);
  const productQuery = await getProductQuery(req, product_id);

  const query: FilterQuery<RevenueAttributes & Document> = {
    ...marketplaceQuery,
    ...partnerQuery,
    ...productQuery,
    ...(currency && { currency: currency.toLocaleLowerCase() }),
  };

  if (timeFilter.$gte || timeFilter.$lte) {
    query.createdAt = timeFilter;
  }

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

export const getSingleRevenue = async (req: IRequest, res: Response) => {
  const { revenueId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

  try {
    const revenue = await RevenueModel.findById(revenueId);

    if (!revenue) return handleResponse(res, 'Revenue not found', 404);

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, revenue.marketplace)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    if (
      userType === 'partner-admin' &&
      !hasAccessToPartner(req, revenue.Partner)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    return handleResponse(res, { data: revenue });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
