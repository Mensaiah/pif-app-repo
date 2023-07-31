import { ObjectId } from 'mongoose';

import { IRequest } from '../../../types/global';
import { generateUniqueAlphanumericCode } from '../../../utils/helpers';
import RedeemCodeModel from '../redeemCode/redeemCode.model';
import { productRedeemCodesType } from '../redeemCode/redeemCode.type';

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

export const generateProductRedeemCode = async (
  quantity: number,
  codeType: productRedeemCodesType,
  productId: ObjectId
) => {
  const redeemCodes = Array.from({ length: quantity }, () => ({
    Product: productId,
    codeType: codeType,
    code: generateUniqueAlphanumericCode(),
  }));

  try {
    const insertedCodes = await RedeemCodeModel.insertMany(redeemCodes);

    return insertedCodes;
  } catch (error) {
    throw new Error('Failed to generate redeem codes.');
  }
};
