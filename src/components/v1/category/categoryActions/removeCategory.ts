import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { CategoryModel } from '../category.model';

const removeCategory = async (req: IRequest, res: Response) => {
  // make sure no product is using it
  const { categoryId } = req.params;
  try {
    const category = await CategoryModel.findById(categoryId);

    if (!category) return handleResponse(res, 'category does not exists', 404);

    if (category.isFunctional)
      return handleResponse(res, 'Category is in use', 403);

    await category.deleteOne();

    return handleResponse(
      res,
      { message: 'category deleted successfully' },
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

export default removeCategory;
