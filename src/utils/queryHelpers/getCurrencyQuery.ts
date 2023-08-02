import { Document, FilterQuery } from 'mongoose';

import PlatformModel from '../../components/v1/platform/platform.model';
import { IRequest } from '../../types/global';

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
