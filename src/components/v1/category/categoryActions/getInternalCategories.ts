import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InternalCategoryModel } from '../category.model';

const getInternalCategories = async (req: IRequest, res: Response) => {
  try {
    const internalCategories = await InternalCategoryModel.find();

    return handleResponse(res, {
      data: internalCategories,
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

export default getInternalCategories;
