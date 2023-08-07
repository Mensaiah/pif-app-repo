import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import ProductModel from '../../product/product.model';
import { InternalCategoryModel } from '../category.model';

const removeInternalCategory = async (req: IRequest, res: Response) => {
  const { internalCategoryId } = req.params;

  try {
    const existingInternalCategory = await InternalCategoryModel.findById(
      internalCategoryId
    );

    if (!existingInternalCategory)
      return handleResponse(res, 'This internal category does not exist', 404);

    // make sure no product is using it before deleting it

    const internalCategoryProduct = await ProductModel.findOne({
      internalCategory: existingInternalCategory._id,
    });

    if (internalCategoryProduct)
      return handleResponse(res, 'This internal category is in use', 403);

    await existingInternalCategory.deleteOne();

    return handleResponse(
      res,
      { message: 'Internal category deleted successfully' },
      204
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

export default removeInternalCategory;
