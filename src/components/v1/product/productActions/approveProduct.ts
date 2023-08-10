import { Response } from 'express';
import mongoose, { ObjectId } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../../partner/partner.model';
import ProductModel from '../product.model';

const approveProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const currentUser = req.user._id;

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

    existingProduct.isApproved = true;
    existingProduct.approvedBy = currentUser;
    await existingProduct.save({ session });

    if (existingProduct.isActive) {
      const productSupplier = await PartnerModel.findById(
        existingProduct.Partner
      ).session(session);

      if (productSupplier) {
        productSupplier.productCategories = [
          ...new Set([
            ...productSupplier.productCategories,
            ...(existingProduct.categories as unknown as ObjectId[]),
          ]),
        ];
        await productSupplier.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, {
      message: 'Product approved successfully',
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
export default approveProduct;
