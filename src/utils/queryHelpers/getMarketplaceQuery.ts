import { FilterQuery } from 'mongoose';

import platformConstants from '../../config/platformConstants';
import { IRequest } from '../../types/global';

const determineMarketplaceQueryForAdmin = (
  userType: string,
  role: string,
  userAccess: any,
  marketplace: string
): string | { $in: string[] } | undefined => {
  let marketplaceQuery;

  if (userType === 'platform-admin') {
    if (!platformConstants.topAdminRoles.includes(role as any)) {
      if (
        marketplace !== 'all' &&
        userAccess.marketplaces?.includes(marketplace)
      ) {
        marketplaceQuery = marketplace;
      }
    } else if (marketplace !== 'all') {
      marketplaceQuery = marketplace;
    }
  }

  return marketplaceQuery;
};

const determineMarketplaceQueryForPartner = (
  userType: string,
  userAccess: any,
  marketplace: string
): string | undefined => {
  let marketplaceQuery;

  if (userType === 'partner-admin') {
    marketplaceQuery =
      marketplace !== 'all' && userAccess.marketplaces?.includes(marketplace)
        ? marketplace
        : userAccess.marketplaces[0];
  }

  return marketplaceQuery;
};

export const getMarketplaceQuery = <T extends Document>(
  req: IRequest,
  marketplace = 'all'
): FilterQuery<T & Document> => {
  const { userType, role, userAccess } = req;
  const query: FilterQuery<
    T & Document & { marketplace?: string | { $in: string[] } }
  > = {};

  const marketplaceQueryForAdmin = determineMarketplaceQueryForAdmin(
    userType,
    role,
    userAccess,
    marketplace
  );
  const marketplaceQueryForPartner = determineMarketplaceQueryForPartner(
    userType,
    userAccess,
    marketplace
  );

  if (marketplaceQueryForAdmin || marketplaceQueryForPartner) {
    query.marketplace = marketplaceQueryForAdmin || marketplaceQueryForPartner;
  } else if (marketplace === 'all' || marketplace?.length === 2) {
    query.marketplace = marketplace;
  }

  return query;
};
