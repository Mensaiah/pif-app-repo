import { IRequest } from '../../types/global';

export const hasAccessToMarketplaces = (
  req: IRequest,
  marketplaces: string[]
): boolean => {
  const { userAccess } = req;
  return marketplaces.some((id) => userAccess.marketplaces.includes(id));
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
