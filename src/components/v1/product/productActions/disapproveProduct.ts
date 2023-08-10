import { Response } from 'express';
import mongoose from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../../partner/partner.model';
import ProductModel from '../product.model';

const disapproveProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

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

    existingProduct.isApproved = false;
    await existingProduct.save({ session });

    const productSupplier = await PartnerModel.findById(
      existingProduct.Partner
    ).session(session);
    // Check each product category
    for (const category of existingProduct.categories) {
      // Check if the partner has other approved and active products in this category
      const approvedActiveProductsInCategory =
        await ProductModel.countDocuments({
          Partner: existingProduct.Partner,
          categories: { $in: [category] },
          isApproved: true,
          isActive: true,
        }).session(session);

      // If not, remove this category from the partner's categories
      if (approvedActiveProductsInCategory === 0) {
        const categoryIndex =
          productSupplier.productCategories.indexOf(category);
        if (categoryIndex > -1) {
          productSupplier.productCategories.splice(categoryIndex, 1);
          await productSupplier.save({ session });
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, {
      message: 'Product disapproved successfully',
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
export default disapproveProduct;
