import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import {
  handleLangSearch,
  handleResponse,
  addSupportedLang,
} from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PlatformModel from '../../platform/platform.model';
import { filterMarketplaces } from '../../platform/platform.utils';
import { CategoryModel } from '../category.model';
import { addCategorySchema } from '../category.policy';

const addCategory = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addCategorySchema>;

  const {
    name,
    isEnabled,
    isBirthday,
    isMain,
    isPromoted,
    iconUrl,
    iconName,
    marketplaces,
  }: dataType = req.body;

  try {
    const langQuery = handleLangSearch(name, 'name.value');

    const iconExists = await CategoryModel.findOne({ iconName });

    if (!iconExists) return handleResponse(res, 'iconName must exist', 400);

    const existingCategory = await CategoryModel.findOne(langQuery);

    if (existingCategory)
      return handleResponse(res, 'This category already exists', 409);

    const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platform)
      return handleResponse(
        res,
        'Error handling request, please try again later',
        500
      );

    const sanitizedMarketplaces = filterMarketplaces(marketplaces, platform);

    if (!sanitizedMarketplaces.length)
      return handleResponse(
        res,
        'None of the marketplace(s) supplied exists or is missing',
        404
      );

    const newCategory = new CategoryModel({
      isEnabled,
      isBirthday,
      isPromoted,
      iconName,
      iconUrl,
      isMain,
      marketplaces: sanitizedMarketplaces,
    });

    newCategory.name = addSupportedLang(name, newCategory.name);

    await newCategory.save();

    return handleResponse(
      res,
      {
        message: 'Category created successfully',
        data: newCategory,
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

export default addCategory;
