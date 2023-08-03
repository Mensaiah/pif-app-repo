import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse } from '../../../../utils/helpers';
import {
  handleReqSearch,
  getMarketplaceQuery,
  getPartnerQuery,
} from '../../../../utils/queryHelpers';
import { useWord } from '../../../../utils/wordSheet';
import ProductModel from '../product.model';
import { ProductAttributes } from '../product.types';

const getProducts = async (req: IRequest, res: Response) => {
  const paginate = handlePaginate(req);
  const queryData = handleReqSearch(req, {
    marketplace: 'string',
    partner_id: 'string',
    is_approved: 'boolean',
    low_stock: 'boolean',
    is_pending: 'boolean',
    is_active: 'boolean',
    is_inactive: 'boolean',
    free_gift: 'boolean',
    regular_product: 'boolean',
  });

  const { marketplace, partner_id, low_stock } = queryData;
  let {
    is_approved,
    is_pending,
    is_active,
    is_inactive,
    free_gift,
    regular_product,
  } = queryData;

  if (is_approved && is_pending) {
    is_approved = false;
    is_pending = false;
  }
  if (is_active && is_inactive) {
    is_active = false;
    is_inactive = false;
  }
  if (free_gift && regular_product) {
    free_gift = false;
    regular_product = false;
  }

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);
  const partnerQuery = await getPartnerQuery(req, partner_id);

  const query: FilterQuery<ProductAttributes & Document> = {
    ...marketplaceQuery,
    ...partnerQuery,
    ...(low_stock && { isLowStock: true }),
    ...(is_approved && { isApproved: true }),
    ...(is_pending && { isApproved: false }),
    ...(is_inactive && { isActive: false }),
    ...(free_gift && { productType: 'free-gift' }),
    ...(regular_product && { productType: 'regular-product' }),
  };

  try {
    const selectedFields = '-isApproved -categories -internalCategory';

    const allProducts = await ProductModel.find(
      query,
      selectedFields,
      paginate.queryOptions
    )
      .populate('Partner', 'name')
      .lean();
    const count = await ProductModel.countDocuments(query);

    return handleResponse(res, {
      data: allProducts,
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

export default getProducts;
