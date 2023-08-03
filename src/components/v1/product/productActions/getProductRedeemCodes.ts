import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import RedeemCodeModel from '../../redeemCode/redeemCode.model';
import ProductModel from '../product.model';
import { checkProductAccess } from '../product.utils';

const getProductRedeemCodes = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) return handleResponse(res, 'Product not found', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        "You don't have the permission to perform this action.",
        403
      );

    const productRedeemCodes = await RedeemCodeModel.find({
      Product: existingProduct._id,
    });

    return handleResponse(res, { data: productRedeemCodes });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getProductRedeemCodes;
