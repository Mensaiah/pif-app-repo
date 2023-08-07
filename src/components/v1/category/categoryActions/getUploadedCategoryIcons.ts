import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { CategoryIconModel } from '../category.model';

const getUploadedCategoryIcons = async (req: IRequest, res: Response) => {
  const userType = req.userType;

  try {
    const categoryIcons = await CategoryIconModel.find(
      userType !== 'platform-admin' ? { isDisabled: false } : {}
    );
    return handleResponse(res, {
      data: categoryIcons,
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

export default getUploadedCategoryIcons;
