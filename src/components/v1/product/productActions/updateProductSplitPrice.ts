import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import DiscountCodeModel from '../../discountCode/discountCode.model';
import ProductModel from '../product.model';
import { updateProductSplitPriceSchema } from '../product.policy';

const updateProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId, code } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

  type dataType = z.infer<typeof updateProductSplitPriceSchema>;

  const {
    newCode,
    discountType,
    maximumUseCount,
    maximumUsePerCustomer,
    minimumOrderAmount,
    validityEnd,
    validityStart,
    value,
  }: dataType = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingProduct = await ProductModel.findById(productId).session(
      session
    );

    if (!existingProduct) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Product does not exist', 404);
    }

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, existingProduct.marketplace)
    ) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );
    }

    if (
      userType === 'partner-admin' &&
      !hasAccessToPartner(req, existingProduct.Partner)
    ) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );
    }

    const existingProductSplitPrice = await DiscountCodeModel.findOne({
      code,
      Product: productId,
    }).session(session);

    if (!existingProductSplitPrice) {
      await session.abortTransaction();
      session.endSession;

      return handleResponse(
        res,
        'The product discount code does not exist',
        409
      );
    }

    if (maximumUseCount)
      existingProductSplitPrice.maximumUseCount = maximumUseCount;

    if (maximumUsePerCustomer)
      existingProductSplitPrice.maximumUsePerCustomer = maximumUsePerCustomer;

    if (validityEnd)
      existingProductSplitPrice.validityEnd = new Date(validityEnd);

    // only update if useCount is zero
    if (existingProductSplitPrice.useCount > 0) {
      if (existingProductSplitPrice.isModified()) {
        await existingProductSplitPrice.save({ session });

        await session.commitTransaction();
        session.endSession();

        return handleResponse(res, {
          message: 'Product split price updated successfully',
          data: existingProductSplitPrice,
        });
      }

      await session.abortTransaction();
      session.endSession;

      return handleResponse(res, 'This split price is in use', 403);
    }

    if (newCode) existingProductSplitPrice.code = newCode;

    if (value) existingProductSplitPrice.value = value;

    if (discountType) existingProductSplitPrice.discountType = discountType;

    if (minimumOrderAmount)
      existingProductSplitPrice.minimumOrderAmount = minimumOrderAmount;

    if (validityStart)
      existingProductSplitPrice.validityStart = new Date(validityStart);

    if (existingProductSplitPrice.isModified()) {
      await existingProductSplitPrice.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, {
      message: 'Product split price updated successfully',
      data: existingProduct,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default updateProductSplitPrice;
