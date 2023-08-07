import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, addSupportedLang } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InternalCategoryModel } from '../category.model';
import { addInternalCategorySchema } from '../category.policy';

const editInternalCategory = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addInternalCategorySchema>;

  const { internalCategoryId } = req.params;

  const { name }: dataType = req.body;

  try {
    const existingInternalCategory = await InternalCategoryModel.findById(
      internalCategoryId
    );

    if (!existingInternalCategory)
      return handleResponse(res, 'Internal category not found', 404);

    existingInternalCategory.name = addSupportedLang(
      name,
      existingInternalCategory.name
    );

    await existingInternalCategory.save();

    return handleResponse(res, {
      message: 'Internal category renamed successfully',
      data: existingInternalCategory,
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

export default editInternalCategory;
