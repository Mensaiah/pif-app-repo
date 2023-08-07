import { ObjectId } from 'mongoose';

import { generateUniqueAlphanumericCode } from '../../../utils/helpers';
import RedeemCodeModel from '../redeemCode/redeemCode.model';
import { productRedeemCodesType } from '../redeemCode/redeemCode.type';

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
