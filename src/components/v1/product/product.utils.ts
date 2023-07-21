import { IRequest } from '../../../types/global';

import { ProductAttributes } from './product.types';

export const checkProductAccess = (
  req: IRequest,
  product: ProductAttributes
) => {
  const { userAccess, userType, user } = req;

  const productMarketplace = userAccess.marketplaces.includes(
    product.marketplace
  );

  const isSupportedUser =
    userType === 'platform-admin' && userAccess.role === 'super-admin'
      ? true
      : userType === 'partner-admin'
      ? user.Partner == product.Partner
      : userType === 'platform-admin'
      ? productMarketplace
      : false;

  return isSupportedUser;
};
