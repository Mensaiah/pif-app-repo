import { Response } from 'express';
import { ObjectId } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../../partner/partner.model';
import ProductModel from '../product.model';

const approveProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const currentUser = req.user._id;
  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    existingProduct.isApproved = true;
    existingProduct.approvedBy = currentUser;
    await existingProduct.save();

    if (existingProduct.isActive) {
      const productSupplier = await PartnerModel.findById(
        existingProduct.Partner
      );

      if (productSupplier) {
        productSupplier.productCategories = [
          ...new Set([
            ...productSupplier.productCategories,
            ...(existingProduct.categories as unknown as ObjectId[]),
          ]),
        ];
        await productSupplier.save();
      }
    }

    return handleResponse(res, {
      message: 'Product approved successfully',
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

export default approveProduct;
