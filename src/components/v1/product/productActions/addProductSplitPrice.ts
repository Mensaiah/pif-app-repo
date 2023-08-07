import { Response } from 'express';
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
import { addProductSplitPriceSchema } from '../product.policy';

const addProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

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

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, existingProduct.marketplace)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    if (
      userType === 'partner-admin' &&
      !hasAccessToPartner(req, existingProduct.Partner)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
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
