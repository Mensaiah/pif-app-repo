import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import {
  handleLangSearch,
  handleResponse,
  addSupportedLang,
} from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InternalCategoryModel } from '../category.model';
import { addInternalCategorySchema } from '../category.policy';

const addInternalCategory = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addInternalCategorySchema>;

  const { name }: dataType = req.body;

  const currentUser = req.user._id;

  const langQuery = handleLangSearch(name, 'name.value');

  try {
    const existingInternalCategory = await InternalCategoryModel.findOne(
      langQuery
    );

    if (existingInternalCategory)
      return handleResponse(res, 'This internal category already exists', 409);

    const newInternalCategory = new InternalCategoryModel({
      addedBy: currentUser,
    });

    newInternalCategory.name = addSupportedLang(name, newInternalCategory.name);

    await newInternalCategory.save();

    return handleResponse(
      res,
      {
        message: 'Internal category created successfully.',
        data: newInternalCategory,
      },
      201
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

export default addInternalCategory;
