import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import DiscountCodeModel from '../../discountCode/discountCode.model';
import ProductModel from '../product.model';
import { addProductSplitPriceSchema } from '../product.policy';
import { checkProductAccess } from '../product.utils';

const addProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  type dataType = z.infer<typeof addProductSplitPriceSchema>;

  const {
    code,
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
        'You are not authorized to add split price to this product.',
        403
      );

    const existingProductSplitPrice = await DiscountCodeModel.findOne({
      code,
      Product: productId,
    });

    if (existingProductSplitPrice)
      return handleResponse(
        res,
        'A split price with this code already exists',
        409
      );

    const newProductSplitPrice = await new DiscountCodeModel({
      code,
      Product: productId,
      value,
      discountType,
      minimumOrderAmount,
      maximumUseCount,
      maximumUsePerCustomer,
      validityStart: new Date(validityStart),
      validityEnd: new Date(validityEnd),
    }).save();

    return handleResponse(
      res,
      {
        message: 'Split price added to product successfully',
        data: newProductSplitPrice,
      },
      201
    );
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default addProductSplitPrice;
