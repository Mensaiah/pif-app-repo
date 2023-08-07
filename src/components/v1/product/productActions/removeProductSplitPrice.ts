import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import DiscountCodeModel from '../../discountCode/discountCode.model';
import ProductModel from '../product.model';

const removeProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId, code } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

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
