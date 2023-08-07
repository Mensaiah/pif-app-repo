import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../../partner/partner.model';
import ProductModel from '../product.model';

const removeProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

  try {
    const existingProduct = await ProductModel.findById(productId);
    const existingProductCopy = { ...existingProduct.toObject() };

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

    if (existingProduct.qtySold > 0)
      return handleResponse(
        res,
        'This product is in use. Cannot be removed. You can rather disabled it',
        403
      );

    existingProduct.deletedAt = new Date();

    await existingProduct.save();

    const productSupplier = await PartnerModel.findById(
      existingProductCopy.Partner
    );

    if (productSupplier) {
      for (const category of existingProductCopy.categories) {
        // Check if the partner has other approved and active products in this category
        const approvedActiveProductsInCategory =
          await ProductModel.countDocuments({
            Partner: existingProductCopy.Partner,
            categories: { $in: [category] },
            isApproved: true,
            isActive: true,
          });

        // If not, remove this category from the partner's categories
        if (approvedActiveProductsInCategory === 0) {
          const categoryIndex =
            productSupplier.productCategories.indexOf(category);
          if (categoryIndex > -1) {
            productSupplier.productCategories.splice(categoryIndex, 1);
            await productSupplier.save();
          }
        }
      }
    }

    return handleResponse(res, 'product deleted successfully', 204);
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default removeProduct;
