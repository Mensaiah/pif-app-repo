import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { CategoryIconModel } from '../category.model';

const disableUploadedCategoryIcon = async (req: IRequest, res: Response) => {
  const { categoryIconId } = req.params;

  try {
    const categoryIcon = await CategoryIconModel.findById(categoryIconId);

    if (!categoryIcon)
      return handleResponse(res, 'Category icon not found', 404);

    categoryIcon.isDisabled = true;

    await categoryIcon.save();

    return handleResponse(
      res,
      {
        message: 'Category icon disabled successfully',
      },
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

export default disableUploadedCategoryIcon;
