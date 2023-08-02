import { IRequest } from '../../types/global';

export const handleObjectIdQuery = (
  req: IRequest,
  objectIds: string[]
): boolean => {
  const { userAccess } = req;
  return objectIds.some((id) => userAccess.marketplaces.includes(id));
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
