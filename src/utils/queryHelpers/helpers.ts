import { IRequest } from '../../types/global';

export const hasAccessToMarketplaces = (
  req: IRequest,
  marketplaces: string | string[]
): boolean => {
  const { userAccess } = req;

  // Convert marketplaces to an array if it isn't already
  const marketplacesArray = Array.isArray(marketplaces)
    ? marketplaces
    : [marketplaces];

  return marketplacesArray.every((id) => userAccess.marketplaces.includes(id));
};

export const handlePartnerAdminUser = (req: IRequest): boolean => {
  const { userType, userAccess } = req;
  if (userType === 'partner-admin') {
    if (userAccess.marketplaces.length > 0) {
      return false;
    } else {
      req.sendEmptyData = true;
      return true;
    }
  }
  return false;
};
