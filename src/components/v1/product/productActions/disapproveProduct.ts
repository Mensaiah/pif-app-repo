import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../../partner/partner.model';
import ProductModel from '../product.model';

const disapproveProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    existingProduct.isApproved = false;
    await existingProduct.save();

    const productSupplier = await PartnerModel.findById(
      existingProduct.Partner
    );
    // Check each product category
    for (const category of existingProduct.categories) {
      // Check if the partner has other approved and active products in this category
      const approvedActiveProductsInCategory =
        await ProductModel.countDocuments({
          Partner: existingProduct.Partner,
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

    return handleResponse(res, {
      message: 'Product disapproved successfully',
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
export default disapproveProduct;
