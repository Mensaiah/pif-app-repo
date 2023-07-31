import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../types/global';
import {
  addSupportedLang,
  handleLangSearch,
  handleResponse,
} from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';
import DiscountCodeModel from '../discountCode/discountCode.model';
import { PartnerModel } from '../partner/partner.model';
import PlatformModel from '../platform/platform.model';
import { filterMarketplaces } from '../platform/platform.utils';

import ProductModel from './product.model';
import {
  addProductSchema,
  addProductSplitPriceSchema,
  updateProductSchema,
  updateProductSplitPriceSchema,
} from './product.policy';
import { checkProductAccess } from './product.utils';

export const getProducts = async (req: IRequest, res: Response) => {
  const { marketplace } = req.params;

  try {
    const query = marketplace ? { marketplace } : {};
    const selectedFields = '-isApproved -categories -internalCategory';

    const allProducts = await ProductModel.find(query, selectedFields).populate(
      'Partner',
      'name'
    );

    return handleResponse(res, { data: allProducts });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const getProductsByCategoryAndPartner = async (
  req: IRequest,
  res: Response
) => {
  const { categoryId, partnerId, marketplace } = req.params;

  try {
    const products = await ProductModel.find(
      {
        categories: { $in: [categoryId] },
        Partner: partnerId,
        marketplace,
        isActive: true,
        isApproved: true,
        deletedAt: { $exists: false },
      },
      {
        name: 1,
        caption: 1,
        description: 1,
        disclaimer: 1,
        textForReceiver: 1,
        tags: 1,
        price: 1,
        marketplace: 1,
        photo: 1,
        photos: 1,
        slicePrice: 1,
        isRated18: 1,
      }
    );

    return handleResponse(res, { data: products });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const getSingleProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const { userType } = req;
  const isGuestOrCustomer = !userType || userType === 'customer';

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = isGuestOrCustomer
      ? { _id: productId, deletedAt: { $exists: false } }
      : { _id: productId };
    const selectedFields = isGuestOrCustomer
      ? 'name caption description disclaimer textForReceiver tags price marketplace photo photos slicePrice isRated18'
      : '';
    if (isGuestOrCustomer) query.isActive = true;
    if (userType !== 'platform-admin') query.isApproved = true;

    const product = await (isGuestOrCustomer
      ? ProductModel.findOne(query, selectedFields)
      : ProductModel.findOne(query)
          .populate('categories', 'name')
          .populate('internalCategory', 'name'));

    if (!product) return handleResponse(res, 'Product does not exist', 404);

    return handleResponse(res, { data: product });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const addProduct = async (req: IRequest, res: Response) => {
  try {
    // a product is active by default
    // a product needs approval so isApproved should be false

    type dataType = z.infer<typeof addProductSchema>;
    const {
      name,
      caption,
      description,
      disclaimer,
      categories,
      tags,
      price,
      isRated18,
      photo,
      photos,
      quantity,
      quantityAlert,
      internalCategory,
      extraProduct,
      marketplace,
      partnerId,
      productType,
      validThru,
      textForReceiver,
      canBeRedeemedAsRewards,
      canBeSent,
      canBeSentPeriodType,
      canBeSentPeriodValue,
      isBonusProductOnly,
      isCountedTowardsReward,
      redemptionValidityPeriodType,
      redemptionValidityType,
      redemptionValidityValue,
      slicePrice,
      redeemType,
    }: dataType = req.body;

    const langQuery = handleLangSearch(name, 'name.value');

    const existingProduct = await ProductModel.findOne(langQuery);

    if (existingProduct)
      return handleResponse(res, 'This product already exists', 409);

    const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

    if (!platform)
      return handleResponse(
        res,
        'Error handling request, please try again later',
        500
      );

    const sanitizedMarketplace = filterMarketplaces([marketplace], platform);

    if (!sanitizedMarketplace.length)
      return handleResponse(
        res,
        'The marketplace supplied does not exists or is missing',
        404
      );

    // updated partner categories
    const productSupplier = await PartnerModel.findById(partnerId, '_id');

    if (!productSupplier) {
      return handleResponse(res, 'Partner does not exist', 404);
    }

    const newProduct = new ProductModel({
      Partner: partnerId,
      tags,
      categories,
      internalCategory,
      isRated18,
      photo: photo || (photos && photos.length) ? photos[0] : '',
      photos,
      marketplace,
      price,
      productType: productType || 'regular-product',
      isActive: true,
      isApproved: false,
      canBeRedeemedAsRewards,
      isBonusProductOnly,
      isCountedTowardsReward,
      slicePrice,
      redeemType,
      quantity,
    });

    newProduct.name = addSupportedLang(name, newProduct.name);

    if (caption)
      newProduct.caption = addSupportedLang(caption, newProduct.caption);

    if (quantityAlert) newProduct.quantityAlert = quantityAlert;

    if (disclaimer)
      newProduct.disclaimer = addSupportedLang(
        disclaimer,
        newProduct.disclaimer
      );

    if (description)
      newProduct.description = addSupportedLang(
        description,
        newProduct.description
      );

    if (textForReceiver)
      newProduct.textForReceiver = addSupportedLang(
        textForReceiver,
        newProduct.textForReceiver
      );

    if (canBeSent && canBeSentPeriodType && canBeSentPeriodValue) {
      newProduct.canBeSent = canBeSent;
      newProduct.canBeSentPeriodType = canBeSentPeriodType;
      newProduct.canBeSentPeriodValue = canBeSentPeriodValue;
    }

    if (redemptionValidityType === 'date' && redemptionValidityValue) {
      newProduct.redemptionValidityType = redemptionValidityType;
      newProduct.redemptionValidityValue = redemptionValidityValue;
    }

    if (
      redemptionValidityType === 'period' &&
      redemptionValidityPeriodType &&
      redemptionValidityValue
    ) {
      newProduct.redemptionValidityType = redemptionValidityType;
      newProduct.redemptionValidityPeriodType = redemptionValidityPeriodType;
      newProduct.redemptionValidityValue = +redemptionValidityValue;
    }

    if (extraProduct) {
      newProduct.extraProduct.description = addSupportedLang(
        extraProduct.description,
        newProduct.extraProduct.description
      );

      newProduct.extraProduct.photo = extraProduct.photo;
    }

    if (validThru) newProduct.validThru = new Date(validThru);

    await newProduct.save();

    return handleResponse(
      res,
      {
        message: 'Product created successfully',
        data: newProduct,
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

export const approveProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const currentUser = req.user._id;
  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    existingProduct.isApproved = true;
    existingProduct.approvedBy = currentUser;
    await existingProduct.save();

    if (existingProduct.isActive) {
      const productSupplier = await PartnerModel.findById(
        existingProduct.Partner
      );

      if (productSupplier) {
        productSupplier.productCategories = [
          ...new Set([
            ...productSupplier.productCategories,
            ...(existingProduct.categories as unknown as ObjectId[]),
          ]),
        ];
        await productSupplier.save();
      }
    }

    return handleResponse(res, {
      message: 'Product approved successfully',
      data: existingProduct,
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

export const disapproveProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    existingProduct.isApproved = false;
    await existingProduct.save();

    const productSupplier = await PartnerModel.findById(
      existingProduct.Partner
    );
    // Check each product category
    for (const category of existingProduct.categories) {
      // Check if the partner has other approved and active products in this category
      const approvedActiveProductsInCategory =
        await ProductModel.countDocuments({
          Partner: existingProduct.Partner,
          categories: { $in: [category] },
          isApproved: true,
          isActive: true,
        });

      // If not, remove this category from the partner's categories
      if (approvedActiveProductsInCategory === 0) {
        const categoryIndex =
          productSupplier.productCategories.indexOf(category);
        if (categoryIndex > -1) {
          productSupplier.productCategories.splice(categoryIndex, 1);
          await productSupplier.save();
        }
      }
    }

    return handleResponse(res, {
      message: 'Product disapproved successfully',
      data: existingProduct,
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

export const updateProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  type dataType = z.infer<typeof updateProductSchema>;

  const {
    name,
    caption,
    disclaimer,
    description,
    tags,
    price,
    isRated18,
    photo,
    photos,
    quantity,
    quantityAlert,
    extraProduct,
    productType,
    validThru,
    textForReceiver,
    canBeRedeemedAsRewards,
    canBeSent,
    canBeSentPeriodType,
    canBeSentPeriodValue,
    isBonusProductOnly,
    isCountedTowardsReward,
    redemptionValidityPeriodType,
    redemptionValidityType,
    redemptionValidityValue,
    slicePrice,
    categories,
    internalCategory,
    redeemType,
  }: dataType = req.body;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    // TODO: if the person is a partner-admin, ensure that the product belongs to the partner

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to edit this product.',
        403
      );

    const shouldUpdateCategories =
      categories &&
      existingProduct.categories.join(',') !== categories.join(',');

    if (name)
      existingProduct.name = addSupportedLang(name, existingProduct.name);

    if (caption)
      existingProduct.caption = addSupportedLang(
        caption,
        existingProduct.caption
      );

    if (disclaimer)
      existingProduct.disclaimer = addSupportedLang(
        disclaimer,
        existingProduct.disclaimer
      );

    if (description)
      existingProduct.description = addSupportedLang(
        description,
        existingProduct.description
      );

    if (tags) existingProduct.tags = tags;

    if (productType) existingProduct.productType = productType;

    if (validThru) existingProduct.validThru = new Date(validThru);

    if (textForReceiver)
      existingProduct.textForReceiver = addSupportedLang(
        textForReceiver,
        existingProduct.textForReceiver
      );

    if (price) existingProduct.price = price;

    if (extraProduct) {
      existingProduct.extraProduct.description = addSupportedLang(
        extraProduct.description,
        existingProduct.extraProduct.description
      );

      existingProduct.extraProduct.photo = extraProduct.photo;
    }

    existingProduct.isRated18 = isRated18;

    if (photo) existingProduct.photo = photo;

    if (photos) existingProduct.photos = photos;

    if (quantity && quantityAlert) {
      existingProduct.quantity = quantity;
      existingProduct.quantityAlert = quantityAlert;
    } else if (quantity === -1) {
      existingProduct.quantity = quantity;
    }

    if (slicePrice) existingProduct.slicePrice = slicePrice;

    existingProduct.isCountedTowardsReward = isCountedTowardsReward;

    existingProduct.canBeRedeemedAsRewards = canBeRedeemedAsRewards;

    existingProduct.isBonusProductOnly = isBonusProductOnly;

    if (canBeSent && canBeSentPeriodType && canBeSentPeriodValue) {
      existingProduct.canBeSent = canBeSent;
      existingProduct.canBeSentPeriodType = canBeSentPeriodType;
      existingProduct.canBeSentPeriodValue = canBeSentPeriodValue;
    }

    if (redemptionValidityType === 'date' && redemptionValidityValue) {
      existingProduct.redemptionValidityType = redemptionValidityType;
      existingProduct.redemptionValidityValue = redemptionValidityValue;
    }

    if (
      redemptionValidityType === 'period' &&
      redemptionValidityPeriodType &&
      redemptionValidityValue
    ) {
      existingProduct.redemptionValidityType = redemptionValidityType;
      existingProduct.redemptionValidityPeriodType =
        redemptionValidityPeriodType;
      existingProduct.redemptionValidityValue = redemptionValidityValue;
    }

    if (internalCategory)
      existingProduct.internalCategory =
        internalCategory as unknown as ObjectId;

    if (shouldUpdateCategories) {
      // updated partner categories
      existingProduct.categories = categories as unknown as ObjectId[];
    }

    if (redeemType) existingProduct.redeemType = redeemType;

    await existingProduct.save();

    if (shouldUpdateCategories) {
      const productSupplier = await PartnerModel.findById(
        existingProduct.Partner
      );

      if (productSupplier) {
        for (const category of existingProduct.categories) {
          // Check if the partner has other approved and active products in this category
          const approvedActiveProductsInCategory =
            await ProductModel.countDocuments({
              Partner: existingProduct.Partner,
              categories: { $in: [category] },
              isApproved: true,
              isActive: true,
            });

          // If not, remove this category from the partner's categories
          if (approvedActiveProductsInCategory === 0) {
            const categoryIndex =
              productSupplier.productCategories.indexOf(category);
            if (categoryIndex > -1) {
              productSupplier.productCategories.splice(categoryIndex, 1);
              await productSupplier.save();
            }
          }
        }
      }
    }

    return handleResponse(res, {
      message: 'Product updated successfully',
      data: existingProduct,
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

export const removeProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);
    const existingProductCopy = { ...existingProduct.toObject() };

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to delete this product.',
        403
      );

    if (existingProduct.qtySold > 0)
      return handleResponse(
        res,
        'This product is in use. Cannot be removed. You can rather disabled it',
        403
      );

    existingProduct.deletedAt = new Date();

    await existingProduct.save();

    const productSupplier = await PartnerModel.findById(
      existingProductCopy.Partner
    );

    if (productSupplier) {
      for (const category of existingProductCopy.categories) {
        // Check if the partner has other approved and active products in this category
        const approvedActiveProductsInCategory =
          await ProductModel.countDocuments({
            Partner: existingProductCopy.Partner,
            categories: { $in: [category] },
            isApproved: true,
            isActive: true,
          });

        // If not, remove this category from the partner's categories
        if (approvedActiveProductsInCategory === 0) {
          const categoryIndex =
            productSupplier.productCategories.indexOf(category);
          if (categoryIndex > -1) {
            productSupplier.productCategories.splice(categoryIndex, 1);
            await productSupplier.save();
          }
        }
      }
    }

    return handleResponse(res, 'product deleted successfully', 204);
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const addProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  type dataType = z.infer<typeof addProductSplitPriceSchema>;

  const {
    code,
    discountType,
    maximumUseCount,
    maximumUsePerCustomer,
    minimumOrderAmount,
    validityEnd,
    validityStart,
    value,
  }: dataType = req.body;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to add split price to this product.',
        403
      );

    const existingProductSplitPrice = await DiscountCodeModel.findOne({
      code,
      Product: productId,
    });

    if (existingProductSplitPrice)
      return handleResponse(
        res,
        'A split price with this code already exists',
        409
      );

    const newProductSplitPrice = await new DiscountCodeModel({
      code,
      Product: productId,
      value,
      discountType,
      minimumOrderAmount,
      maximumUseCount,
      maximumUsePerCustomer,
      validityStart: new Date(validityStart),
      validityEnd: new Date(validityEnd),
    }).save();

    return handleResponse(
      res,
      {
        message: 'Split price added to product successfully',
        data: newProductSplitPrice,
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

export const updateProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId, code } = req.params;

  type dataType = z.infer<typeof updateProductSplitPriceSchema>;

  const {
    newCode,
    discountType,
    maximumUseCount,
    maximumUsePerCustomer,
    minimumOrderAmount,
    validityEnd,
    validityStart,
    value,
  }: dataType = req.body;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to edit the split price of this product.',
        403
      );

    const existingProductSplitPrice = await DiscountCodeModel.findOne({
      code,
      Product: productId,
    });

    if (!existingProductSplitPrice)
      return handleResponse(
        res,
        'The product discount code does not exist',
        409
      );

    if (maximumUseCount)
      existingProductSplitPrice.maximumUseCount = maximumUseCount;

    if (maximumUsePerCustomer)
      existingProductSplitPrice.maximumUsePerCustomer = maximumUsePerCustomer;

    if (validityEnd)
      existingProductSplitPrice.validityEnd = new Date(validityEnd);

    // only update if useCount is zero
    if (existingProductSplitPrice.useCount > 0) {
      if (existingProductSplitPrice.isModified()) {
        await existingProductSplitPrice.save();
        return handleResponse(res, {
          message: 'Product split price updated successfully',
          data: existingProductSplitPrice,
        });
      }

      return handleResponse(res, 'This split price is in use', 403);
    }

    if (newCode) existingProductSplitPrice.code = newCode;

    if (value) existingProductSplitPrice.value = value;

    if (discountType) existingProductSplitPrice.discountType = discountType;

    if (minimumOrderAmount)
      existingProductSplitPrice.minimumOrderAmount = minimumOrderAmount;

    if (validityStart)
      existingProductSplitPrice.validityStart = new Date(validityStart);

    if (existingProductSplitPrice.isModified()) {
      await existingProductSplitPrice.save();
    }

    return handleResponse(res, {
      message: 'Product split price updated successfully',
      data: existingProduct,
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

export const removeProductSplitPrice = async (req: IRequest, res: Response) => {
  const { productId, code } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to delete this product split price(s).',
        403
      );

    const existingProductSplitPrice = await DiscountCodeModel.findOne({
      code,
      Product: productId,
    });

    if (!existingProductSplitPrice)
      return handleResponse(res, 'The product code does not exist', 404);

    // only remove if useCount is zero
    if (existingProductSplitPrice.useCount > 0)
      return handleResponse(
        res,
        'Cannot remove split price that is already in use',
        403
      );

    await existingProductSplitPrice.deleteOne();

    return handleResponse(res, 'split price deleted successfully', 204);
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const setProductActive = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to delete this product.',
        403
      );

    // only update isActive

    existingProduct.isActive = true;

    await existingProduct.save();

    const productSupplier = await PartnerModel.findById(
      existingProduct.Partner
    );

    if (productSupplier) {
      for (const category of existingProduct.categories) {
        // Check if the partner has other approved and active products in this category
        const approvedActiveProductsInCategory =
          await ProductModel.countDocuments({
            Partner: existingProduct.Partner,
            categories: { $in: [category] },
            isApproved: true,
            isActive: true,
          });

        // If not, remove this category from the partner's categories
        if (approvedActiveProductsInCategory === 0) {
          const categoryIndex =
            productSupplier.productCategories.indexOf(category);
          if (categoryIndex > -1) {
            productSupplier.productCategories.splice(categoryIndex, 1);
            await productSupplier.save();
          }
        }
      }
    }

    return handleResponse(res, {
      message: 'Operation successful, product is active',
      data: existingProduct,
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

export const setProductInactive = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  try {
    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct)
      return handleResponse(res, 'Product does not exist', 404);

    if (!checkProductAccess(req, existingProduct))
      return handleResponse(
        res,
        'You are not authorized to delete this product.',
        403
      );
    // only update isActive

    existingProduct.isActive = false;

    await existingProduct.save();

    const productSupplier = await PartnerModel.findById(
      existingProduct.Partner
    );

    if (productSupplier) {
      for (const category of existingProduct.categories) {
        // Check if the partner has other approved and active products in this category
        const approvedActiveProductsInCategory =
          await ProductModel.countDocuments({
            Partner: existingProduct.Partner,
            categories: { $in: [category] },
            isApproved: true,
            isActive: true,
          });

        // If not, remove this category from the partner's categories
        if (approvedActiveProductsInCategory === 0) {
          const categoryIndex =
            productSupplier.productCategories.indexOf(category);
          if (categoryIndex > -1) {
            productSupplier.productCategories.splice(categoryIndex, 1);
            await productSupplier.save();
          }
        }
      }
    }

    return handleResponse(res, {
      message: 'Operation successful, product has been set to inactive.',
      data: existingProduct,
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

export const getOtherProducts = async (req: IRequest, res: Response) => {
  const { productId, categoryId, marketplace } = req.params;

  try {
    const otherProducts = await ProductModel.find(
      {
        _id: { $ne: productId },
        categories: { $in: [categoryId] },
        isActive: true,
        isApproved: true,
        marketplace,
      },
      {
        name: 1,
        caption: 1,
        description: 1,
        disclaimer: 1,
        textForReceiver: 1,
        tags: 1,
        price: 1,
        marketplace: 1,
        photo: 1,
        photos: 1,
        slicePrice: 1,
        isRated18: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(5);

    return handleResponse(res, { data: otherProducts });
  } catch (error) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      error
    );
  }
};
