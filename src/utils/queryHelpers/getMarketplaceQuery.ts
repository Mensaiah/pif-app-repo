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

/**
 * What if a user doesn't supply marketplace?
If marketplace is not supplied or if its value is 'all', the function checks for the userType and constructs the query based on that:

1. platform-admin:
 - If the user is a top-level admin (req.isUserTopLevelAdmin is true), no specific filter is applied, so the function would return all records.
 - If not a top-level admin, it returns only records where the marketplace field matches one of the marketplaces in userAccess.marketplaces.
2. partner-admin:
 - If userAccess.marketplaces has at least one marketplace, the function returns records where the marketplace field matches one of those in userAccess.marketplaces.
 - If not, the req.sendEmptyData flag is set to true, meaning you probably want to send back an empty data set.
3. customer: Directly sets the req.sendEmptyData flag to true.
*/
