import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import {
  handleResponse,
  checkLang,
  addSupportedLang,
} from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PlatformModel from '../../platform/platform.model';
import { filterMarketplaces } from '../../platform/platform.utils';
import { CategoryModel } from '../category.model';
import { updateCategorySchema } from '../category.policy';

const editCategory = async (req: IRequest, res: Response) => {
  const { categoryId } = req.params;

  type dataType = z.infer<typeof updateCategorySchema>;

  const {
    name,
    isEnabled,
    isFunctional,
    isBirthday,
    isMain,
    isPromoted,
    isSupplierList,
    type,
    marketplaces,
    iconSvg,
    iconUrl,
    iconifyName,
  }: dataType = req.body;

  try {
    const existingCategory = await CategoryModel.findById(categoryId);

    if (!existingCategory)
      return handleResponse(res, 'Category not found', 404);

    const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platform)
      return handleResponse(
        res,
        'Error handling request, please try again later',
        500
      );

    if (checkLang(name)) {
      existingCategory.name = addSupportedLang(name, existingCategory.name);
    }

    existingCategory.isEnabled = isEnabled;

    existingCategory.isFunctional = isFunctional;

    existingCategory.isBirthday = isBirthday;

    existingCategory.isMain = isMain;

    existingCategory.isPromoted = isPromoted;

    existingCategory.isSupplierList = isSupplierList;

    existingCategory.type = type;

    if (iconifyName) {
      existingCategory.Icon = iconifyName;
    }

    if (iconSvg) {
      existingCategory.Icon = iconSvg;
    }

    if (iconUrl) {
      existingCategory.Icon = iconUrl;
    }

    if (marketplaces) {
      const sanitizedMarketplaces = filterMarketplaces(marketplaces, platform);

      if (!sanitizedMarketplaces.length)
        return handleResponse(
          res,
          'None of the marketplace(s) supplied exists or is missing',
          404
        );

      existingCategory.marketplaces = sanitizedMarketplaces;
    }

    await existingCategory.save();

    return handleResponse(res, {
      message: 'category updated successfully',
      data: existingCategory,
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

export default editCategory;
