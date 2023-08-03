import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import {
  handleLangSearch,
  handleResponse,
  addSupportedLang,
} from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../../partner/partner.model';
import PlatformModel from '../../platform/platform.model';
import { filterMarketplaces } from '../../platform/platform.utils';
import ProductModel from '../product.model';
import { addProductSchema } from '../product.policy';

const addProduct = async (req: IRequest, res: Response) => {
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

    if (canBeSent) {
      newProduct.canBeSent = canBeSent;
      if (canBeSentPeriodType && canBeSentPeriodValue) {
        newProduct.canBeSentPeriodType = canBeSentPeriodType;
        newProduct.canBeSentPeriodValue = canBeSentPeriodValue;
      }
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

export default addProduct;
