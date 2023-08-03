import { Response } from 'express';
import { z } from 'zod';

import platformConstants from '../../../../config/platformConstants';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import RedeemCodeModel from '../../redeemCode/redeemCode.model';
import { RedeemCodeAttributes } from '../../redeemCode/redeemCode.type';
import ProductModel from '../product.model';
import { addRedeemCodeSchema } from '../product.policy';
import {
  checkProductAccess,
  generateProductRedeemCode,
} from '../product.utils';

const generateRedeemCodes = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  type dataType = z.infer<typeof addRedeemCodeSchema>;

  const { quantity, codeType }: dataType = req.body;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) return handleResponse(res, 'Product not found', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        "You don't have the permission to perform this action.",
        403
      );

    if (!existingProduct.quantity)
      return handleResponse(res, 'Product quantity is empty', 404);

    const existingProductRedeemCode = await RedeemCodeModel.find({
      Product: existingProduct._id,
    });

    const isProductUnlimited =
      existingProduct.quantity === platformConstants.unlimited;

    const remainingRedeemCodes = isProductUnlimited
      ? quantity
      : existingProduct.quantity - existingProductRedeemCode.length;

    if (quantity > remainingRedeemCodes) {
      return handleResponse(
        res,
        'The quantity specified exceeds the amount that can be generated.',
        400
      );
    }

    const newRedeemCodes = (await generateProductRedeemCode(
      quantity,
      codeType || 'alpha_num',
      existingProduct._id
    )) as (RedeemCodeAttributes & Document)[];

    return handleResponse(res, { data: newRedeemCodes });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default generateRedeemCodes;
