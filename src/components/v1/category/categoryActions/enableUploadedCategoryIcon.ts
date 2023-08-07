import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { CategoryIconModel } from '../category.model';

const enableUploadedCategoryIcon = async (req: IRequest, res: Response) => {
  const { categoryIconId } = req.params;

  try {
    const categoryIcon = await CategoryIconModel.findById(categoryIconId);

    if (!categoryIcon)
      return handleResponse(res, 'Category icon not found', 404);

    categoryIcon.isDisabled = false;

    await categoryIcon.save();

    return handleResponse(res, {
      message: 'Category icon enabled successfully',
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

export default enableUploadedCategoryIcon;
