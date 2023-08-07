import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, addSupportedLang } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../../partner/partner.model';
import ProductModel from '../product.model';
import { updateProductSchema } from '../product.policy';

const updateProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

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

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, existingProduct.marketplace)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    if (
      userType === 'partner-admin' &&
      !hasAccessToPartner(req, existingProduct.Partner)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
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

    if (canBeSent) {
      existingProduct.canBeSent = canBeSent;
      if (canBeSentPeriodType && canBeSentPeriodValue) {
        existingProduct.canBeSentPeriodType = canBeSentPeriodType;
        existingProduct.canBeSentPeriodValue = canBeSentPeriodValue;
      }
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

export default updateProduct;
