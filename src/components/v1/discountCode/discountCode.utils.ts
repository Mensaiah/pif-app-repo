import { ObjectId } from 'mongoose';

import platformConstants from '../../../config/platformConstants';
import { consoleLog } from '../../../utils/helpers';

import DiscountCodeModel, {
  DiscountCodeUsageModel,
} from './discountCode.model';
import DiscountCodeAttributes from './discountCode.types';

const { unlimited } = platformConstants;

export const canDiscountCodeBeApplied = async (
  code: string,
  productId: ObjectId,
  userId: ObjectId
): Promise<[boolean, null | DiscountCodeAttributes]> => {
  try {
    const discountCode = await DiscountCodeModel.findOne({
      Product: productId,
      code,
      isActive: true,
      validityStart: { $lte: new Date() },
      validityEnd: { $gte: new Date() },
    });

    if (!discountCode) return [false, null];

    // if discount code is not unlimited, check if it has been used up
    if (
      discountCode.maximumUseCount !== unlimited &&
      discountCode.useCount >= discountCode.maximumUseCount
    )
      return [false, null];

    const userDiscountCodeUsage = await DiscountCodeUsageModel.count({
      User: userId,
      DiscountCode: discountCode._id,
    });

    if (discountCode.maximumUsePerCustomer !== unlimited) {
      if (discountCode.maximumUsePerCustomer <= userDiscountCodeUsage)
        return [false, null];
    }

    return [true, discountCode];
  } catch (err) {
    consoleLog(err + 'Error in canCodeBeApplied', 'error');
    return [false, null];
  }
};
