import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import DiscountCodeModel from '../../discountCode/discountCode.model';
import ProductModel from '../product.model';
import { updateProductSplitPriceSchema } from '../product.policy';
import { checkProductAccess } from '../product.utils';

const updateProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId, code } = req.params;

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

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to edit the split price of this product.',
        403
      );

    const existingProductSplitPrice = await DiscountCodeModel.findOne({
      code,
      Product: productId,
    });

    if (!existingProductSplitPrice)
      return handleResponse(
        res,
        'The product discount code does not exist',
        409
      );

    if (maximumUseCount)
      existingProductSplitPrice.maximumUseCount = maximumUseCount;

    if (maximumUsePerCustomer)
      existingProductSplitPrice.maximumUsePerCustomer = maximumUsePerCustomer;

    if (validityEnd)
      existingProductSplitPrice.validityEnd = new Date(validityEnd);

    // only update if useCount is zero
    if (existingProductSplitPrice.useCount > 0) {
      if (existingProductSplitPrice.isModified()) {
        await existingProductSplitPrice.save();
        return handleResponse(res, {
          message: 'Product split price updated successfully',
          data: existingProductSplitPrice,
        });
      }

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
      await existingProductSplitPrice.save();
    }

    return handleResponse(res, {
      message: 'Product split price updated successfully',
      data: existingProduct,
    });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default updateProductSplitPrice;
