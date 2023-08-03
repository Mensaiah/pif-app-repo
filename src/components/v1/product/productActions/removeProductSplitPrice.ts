import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import DiscountCodeModel from '../../discountCode/discountCode.model';
import ProductModel from '../product.model';
import { checkProductAccess } from '../product.utils';

const removeProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId, code } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to delete this product split price(s).',
        403
      );

    const existingProductSplitPrice = await DiscountCodeModel.findOne({
      code,
      Product: productId,
    });

    if (!existingProductSplitPrice)
      return handleResponse(res, 'The product code does not exist', 404);

    // only remove if useCount is zero
    if (existingProductSplitPrice.useCount > 0)
      return handleResponse(
        res,
        'Cannot remove split price that is already in use',
        403
      );

    await existingProductSplitPrice.deleteOne();

    return handleResponse(res, 'split price deleted successfully', 204);
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default removeProductSplitPrice;
