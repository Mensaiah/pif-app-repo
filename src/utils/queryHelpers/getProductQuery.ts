import { FilterQuery } from 'mongoose';

import { isPlatformAdminWithMarketplaceAccess } from '../../components/v1/auth/auth.utils';
import ProductModel from '../../components/v1/product/product.model';
import { IRequest } from '../../types/global';

const determineProductQueryForAdmin = async (
  req: IRequest,
  product_id: string,
  product: any
) => {
  let productQuery;

  if (isPlatformAdminWithMarketplaceAccess(req, product.marketplace)) {
    productQuery = product_id;
  }

  return productQuery;
};

const determineProductQueryForPartner = async (
  req: IRequest,
  product_id: string,
  product: any
) => {
  let productQuery;

  if (req.userType === 'partner-admin') {
    if (product.Partner.toString() === req.user.Partner.toString()) {
      productQuery = product_id;
    } else {
      req.sendEmptyData = true;
    }
  }

  return productQuery;
};

export const getProductQuery = async <T extends Document>(
  req: IRequest,
  product_id: string
): Promise<FilterQuery<T & Document>> => {
  const query: FilterQuery<T & Document & { product_id?: string }> = {};

  if (!product_id) return query;

  try {
    const product = await ProductModel.findById(
      product_id,
      'Partner marketplace'
    );

    if (!product) {
      req.sendEmptyData = true;
      return query;
    }

    const productQueryForAdmin = await determineProductQueryForAdmin(
      req,
      product_id,
      product
    );
    const productQueryForPartner = await determineProductQueryForPartner(
      req,
      product_id,
      product
    );

    if (productQueryForAdmin || productQueryForPartner) {
      query.product_id = productQueryForAdmin || productQueryForPartner;
    }

    return query;
  } catch (err) {
    return query;
  }
};
