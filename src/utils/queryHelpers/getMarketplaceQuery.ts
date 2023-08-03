import { FilterQuery } from 'mongoose';

import { IRequest } from '../../types/global';

export const getMarketplaceQuery = <T extends Document>(
  req: IRequest,
  marketplace: string
): FilterQuery<T & Document> => {
  const { userType, userAccess } = req;
  const query: FilterQuery<
    T & Document & { marketplace?: string | { $in: string[] } }
  > = {};

  if (marketplace && marketplace !== 'all' && marketplace.length !== 2) {
    req.sendEmptyData = true;

    return query;
  }

  if (!marketplace || marketplace === 'all') {
    if (userType === 'platform-admin') {
      if (req.isUserTopLevelAdmin) {
        return query;
      } else {
        query.marketplace = { $in: userAccess.marketplaces };

        return query;
      }
    } else if (userType === 'partner-admin') {
      if (userAccess.marketplaces.length > 0) {
        query.marketplace = { $in: userAccess.marketplaces };
        return query;
      } else {
        req.sendEmptyData = true;
        return query;
      }
    } else if (userType === 'customer') {
      req.sendEmptyData = true;
      return query;
    }
  }

  // Handle platform-admin case
  if (userType === 'platform-admin') {
    if (req.isUserTopLevelAdmin) {
      query.marketplace = marketplace;
    } else {
      if (userAccess.marketplaces?.includes(marketplace)) {
        query.marketplace = marketplace;
      } else {
        req.sendEmptyData = true;
      }
    }
  }
  // Handle partner-admin case
  else if (userType === 'partner-admin') {
    if (userAccess.marketplaces?.includes(marketplace)) {
      query.marketplace = marketplace;
    } else {
      req.sendEmptyData = true;
    }
  }
  // If the userType is neither platform-admin nor partner-admin, return empty data.
  else {
    req.sendEmptyData = true;
  }

  return query;
};