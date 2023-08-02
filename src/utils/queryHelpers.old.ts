import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { ParsedQs } from 'qs';
import validator from 'validator';

import { isPlatformAdminWithMarketplaceAccess } from '../components/v1/auth/auth.utils';
import { PartnerModel } from '../components/v1/partner/partner.model';
import PlatformModel from '../components/v1/platform/platform.model';
import ProductModel from '../components/v1/product/product.model';
import { UserModel } from '../components/v1/user/user.model';
import platformConstants from '../config/platformConstants';
import { IRequest } from '../types/global';

type QueryMap = {
  [key: string]: 'number' | 'positive' | 'string' | 'email' | 'boolean';
};

type ValueType<T> = T extends 'number' | 'positive'
  ? number
  : T extends 'boolean'
  ? boolean
  : string | null;

type QueryResult<T extends QueryMap> = {
  [K in keyof T]: ValueType<T[K]>;
};

const parseType = <
  T extends 'number' | 'positive' | 'string' | 'email' | 'boolean'
>(
  value: ParsedQs | ParsedQs[] | string | string[],
  type: T
): ValueType<T> => {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (typeof value === 'object') {
    return null;
  }

  let parsedValue: number | string | boolean = value as string;

  switch (type) {
    case 'number':
    case 'positive':
      parsedValue = parseInt(parsedValue as string);
      if (type === 'positive') {
        return (
          (parsedValue as number) >= 0 ? parsedValue : null
        ) as ValueType<T>;
      }
      return (
        isNaN(parsedValue as number) ? null : parsedValue
      ) as ValueType<T>;
    case 'string':
    case 'email':
      parsedValue = validator.blacklist(
        (parsedValue as string) || '',
        '<>[]\\/{}="'
      );
      if (type === 'email') {
        return (
          validator.isEmail(parsedValue as string) ? parsedValue : null
        ) as ValueType<T>;
      }
      return (parsedValue || null) as ValueType<T>;
    case 'boolean':
      parsedValue =
        parsedValue === 'true' ? true : parsedValue === 'false' ? false : null;
      return parsedValue as ValueType<T>;
    default:
      return null;
  }
};

export const handleReqSearch = <T extends QueryMap>(
  req: Request,
  keys: T
): QueryResult<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const [field, type] of Object.entries(keys)) {
    const value = req.query[field];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result[field] = parseType(value, type as any);
  }

  return result;
};

export const getMarketplaceQuery = <T extends Document>(
  req: IRequest,
  marketplace = 'all'
): FilterQuery<T & Document> => {
  const { userType, role, userAccess } = req;
  const query: FilterQuery<
    T & Document & { marketplace?: string | { $in: string[] } }
  > = {};

  // Check if userType is 'platform-admin' and not a top admin
  if (
    userType === 'platform-admin' &&
    !platformConstants.topAdminRoles.includes(role as any)
  ) {
    // If marketplace is stated, check access
    if (
      marketplace !== 'all' &&
      userAccess.marketplaces?.includes(marketplace)
    ) {
      query.marketplace = marketplace;
    } else {
      // Set marketplace query to the ones in userAccess.marketplaces
      query.marketplace = { $in: userAccess.marketplaces };
    }
    return query;
  }

  // Check if userType is 'platform-admin' and is a top admin
  if (
    userType === 'platform-admin' &&
    platformConstants.topAdminRoles.includes(role as any)
  ) {
    if (marketplace !== 'all') {
      query.marketplace = marketplace;
    }
    // If 'all' or unspecified, no need to set query.marketplace (implicitly 'all')
    return query;
  }

  // Check if userType is 'partner-admin'
  if (userType === 'partner-admin') {
    if (marketplace === 'all') {
      req.sendEmptyData = true;
    } else if (
      marketplace !== 'all' &&
      userAccess.marketplaces?.includes(marketplace)
    ) {
      query.marketplace = marketplace;
    } else if (!marketplace || marketplace === 'all') {
      // If no marketplace is specified, set to first marketplace from userAccess
      query.marketplace = userAccess.marketplaces[0];
    } else {
      req.sendEmptyData = true;
    }
    return query;
  }

  // General rule: If marketplace is 'all', query should be empty
  if (marketplace === 'all') {
    return query;
  }
  // If marketplace isn't 'all', it should be a string of length 2
  else if (marketplace.length === 2) {
    query.marketplace = marketplace;
  } else {
    req.sendEmptyData = true;
  }

  return query;
};

export const getProductQuery = async <T extends Document>(
  req: IRequest,
  product_id: string
): Promise<FilterQuery<T & Document>> => {
  const query: FilterQuery<T & Document & { product_id?: string }> = {};

  const { userType, user } = req;

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

    if (isPlatformAdminWithMarketplaceAccess(req, product.marketplace)) {
      query.product_id = product_id;
    }

    if (userType === 'partner-admin') {
      if (product.Partner.toString() === user.Partner.toString()) {
        query.product_id = product_id;
      } else {
        req.sendEmptyData = true;
      }
    }

    return query;
  } catch (err) {
    return {};
  }
};

export const getPartnerQuery = async <T extends Document>(
  req: IRequest,
  partner_id: string
): Promise<FilterQuery<T & Document>> => {
  const query: FilterQuery<T & Document & { partner_id?: string }> = {};

  const { userType, user } = req;

  if (userType === 'partner-admin') {
    query.partner_id = user.Partner;

    return query;
  }

  if (!partner_id) return query;

  try {
    const partner = partner_id ? await PartnerModel.findById(partner_id) : null;

    if (!partner) {
      req.sendEmptyData = true;
      return query;
    }

    if (!isPlatformAdminWithMarketplaceAccess(req, partner.marketplaces)) {
      req.sendEmptyData = true;
    }

    query.partner_id = partner_id;

    return query;
  } catch (err) {
    return query;
  }
};

export const getUserQuery = async <T extends Document>(
  req: IRequest,
  user_id: string
): Promise<FilterQuery<T & Document>> => {
  const query: FilterQuery<T & Document & { user_id?: string }> = {};

  const { userAccess } = req;

  if (!user_id) return query;

  try {
    const queriedUser = await UserModel.findById(user_id);

    if (!queriedUser) {
      req.sendEmptyData = true;
      return query;
    }

    if (queriedUser.userType !== 'customer') {
      req.sendEmptyData = true;
      return query;
    }

    if (
      isPlatformAdminWithMarketplaceAccess(req, queriedUser.currentMarketplace)
    ) {
      query.user_id;
    }

    if (userAccess.marketplaces?.includes(queriedUser.currentMarketplace)) {
      query.user_id = user_id;
    }

    return query;
  } catch (err) {
    return query;
  }
};

export const getCurrencyQuery = async <T extends Document>(
  req: IRequest,
  currency: string
): Promise<FilterQuery<T & Document>> => {
  const query: FilterQuery<T & Document & { currency?: string }> = {};

  if (!currency) return query;

  currency = currency.toLocaleLowerCase();

  try {
    const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platform) return query;

    if (platform.marketplaces.find((m) => m.currencyCode === currency)) {
      query.currency = currency;
    }

    return query;
  } catch (error) {
    return query;
  }
};
