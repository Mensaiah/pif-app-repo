import { ObjectId } from 'mongoose';

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

export const hasAccessToPartner = (
  req: IRequest,
  partnerId: ObjectId
): boolean => {
  const { userType, user } = req;
  if (req.isUserTopLevelAdmin) return true;

  if (userType === 'partner-admin')
    return user.Partner.toString() === partnerId.toString();

  return false;
};
