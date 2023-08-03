import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../types/global';
import {
  addSupportedLang,
  checkLang,
  handleLangSearch,
  handleResponse,
} from '../../../utils/helpers';
import {
  getMarketplaceQuery,
  handleReqSearch,
} from '../../../utils/queryHelpers';
import { useWord } from '../../../utils/wordSheet';
import PlatformModel from '../platform/platform.model';
import { filterMarketplaces } from '../platform/platform.utils';
import ProductModel from '../product/product.model';

import {
  CategoryIconModel,
  CategoryModel,
  InternalCategoryModel,
} from './category.model';
import {
  addCategorySchema,
  addInternalCategorySchema,
  updateCategorySchema,
} from './category.policy';
import { CategoryAttributes } from './category.types';

export const getCategories = async (req: IRequest, res: Response) => {
  const { userType } = req;

  const { marketplace } = handleReqSearch(req, { marketplace: 'string' });

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);

  const query: FilterQuery<CategoryAttributes & Document> = {
    ...(userType !== 'platform-admin' && {
      isEnabled: true,
      deletedAt: { $exists: false },
    }),
    $and: [
      { 'marketplaces.0': { $exists: true } },
      {
        ...(marketplaceQuery.marketplace && {
          marketplaces: marketplaceQuery.marketplace,
        }),
      },
    ],
  };

  try {
    const categories = await CategoryModel.find(query).lean();

    return handleResponse(res, {
      data: categories,
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

export const getCategoryByMarketplace = async (
  req: IRequest,
  res: Response
) => {
  const { marketplace } = req.params;

  if (marketplace.length !== 2)
    return handleResponse(res, 'invalid marketplace', 400);

  try {
    const categories = await CategoryModel.find(
      {
        isEnabled: true,
        isFunctional: true,
        marketplaces: { $in: [marketplace] },
      },
      'name Icon'
    ).lean();

    return handleResponse(res, {
      data: categories,
    });
  } catch (err) {
    handleResponse(res, 'error fetching categories', 500, err);
  }
};

export const getInternalCategories = async (req: IRequest, res: Response) => {
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

export const getUploadedCategoryIcons = async (
  req: IRequest,
  res: Response
) => {
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

export const addCategory = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addCategorySchema>;

  const {
    name,
    isEnabled,
    isFunctional,
    isBirthday,
    isMain,
    isPromoted,
    isSupplierList,
    type,
    iconSvg,
    iconUrl,
    iconifyName,
    marketplaces,
  }: dataType = req.body;

  try {
    const langQuery = handleLangSearch(name, 'name.value');

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
      isFunctional,
      isBirthday,
      isMain,
      isPromoted,
      isSupplierList,
      type,
      marketplaces: sanitizedMarketplaces,
    });

    if (iconifyName) {
      newCategory.Icon = iconifyName;
    }

    if (iconSvg) {
      newCategory.Icon = iconSvg;
    }

    if (iconUrl) {
      newCategory.Icon = iconUrl;
    }

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

export const editCategory = async (req: IRequest, res: Response) => {
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

export const removeCategory = async (req: IRequest, res: Response) => {
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

export const addInternalCategory = async (req: IRequest, res: Response) => {
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

export const editInternalCategory = async (req: IRequest, res: Response) => {
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

export const removeInternalCategory = async (req: IRequest, res: Response) => {
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

export const removeUploadedCategoryIcon = async (
  req: IRequest,
  res: Response
) => {
  const { categoryIconId } = req.params;

  try {
    const categoryIcon = await CategoryIconModel.findById(categoryIconId);

    if (!categoryIcon)
      return handleResponse(res, 'Category icon not found', 404);

    await categoryIcon.deleteOne();

    return handleResponse(
      res,
      {
        message: 'Category icon deleted successfully',
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

export const disableUploadedCategoryIcon = async (
  req: IRequest,
  res: Response
) => {
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

export const enableUploadedCategoryIcon = async (
  req: IRequest,
  res: Response
) => {
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
