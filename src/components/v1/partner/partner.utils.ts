import { IRequest } from '../../../types/global';

import { PartnerAttributes } from './partner.types';

export const checkPartnerAccess = (
  req: IRequest,
  partner: PartnerAttributes
) => {
  const { userType, user, userAccess } = req;

  const { partnerId } = req.params;

  if (userType === 'partner-admin' && userAccess.role === 'local-partner')
    return false;

  const isSupportedAdmin =
    userType === 'partner-admin'
      ? partnerId === user.Partner.toString()
      : userType === 'platform-admin' && userAccess.role === 'country-admin'
      ? partner.marketplaces.find((mk) => userAccess.marketplaces.includes(mk))
      : true;

  return isSupportedAdmin;
};
