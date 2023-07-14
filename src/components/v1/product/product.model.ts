import { Schema, Types, model } from 'mongoose';

import { languageValuePairSchema } from '../../../utils/db-helpers';

import { ProductAttributes } from './product.types';

const productSchema = new Schema<ProductAttributes>({
  name: [languageValuePairSchema],
  caption: [languageValuePairSchema],
  description: [languageValuePairSchema],
  disclaimer: [languageValuePairSchema],
  textForReceiver: [languageValuePairSchema],
  tags: [String],
  Partner: { type: String, ref: 'Partner' },
  price: Number,
  marketplace: String,
  photo: String,
  photos: [String],
  productType: {
    type: String,
    enum: ['regular-product', 'free-gift'],
  },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  internalCategory: { type: Schema.Types.ObjectId, ref: 'InternalCategory' },
  redemptionValidityType: {
    type: String,
    enum: ['date', 'period'],
  },
  redemptionValidityPeriodType: {
    type: String,
    enum: ['days', 'weeks', 'months'],
  },
  redemptionValidityValue: String,
  extraProduct: {
    description: [languageValuePairSchema],
    photo: String,
  },
  validThru: Date,
  quantity: Number,
  qtySold: Number,
  deletedAt: Date,
  version: Number,
  isCurrentVersion: Boolean,
  originId: Number,
  order: Boolean,
  quantityAlert: Number,
  tax: Number,
  cities: [{ type: Schema.Types.ObjectId, ref: 'City' }],
  isCountedTowardsReward: Boolean,
  canBeRedeemedAsRewards: Boolean,
  isBonusProductOnly: Boolean,
  slicePrice: Number,
  isRated18: Boolean,
  productCode: {
    code: String,
    eanCodeSource: Number,
    purchaseId: String,
    validatedAt: Date,
  },
  isActive: Boolean,
  isApproved: Boolean,
  approvedBy: { type: Types.ObjectId, ref: 'User' },
  canBeSent: {
    type: String,
    enum: ['immediately', 'next-period'],
  },
  canBeSentPeriodType: {
    type: String,
    enum: ['hour', 'day', 'week', 'month'],
  },
  canBeSentPeriodValue: Number,
  splitPrices: [
    {
      code: String,
      discountType: {
        type: String,
        enum: ['fixed', 'percentage'],
      },
      value: Number,
      useCount: { type: Number, default: 0 },
      clickCount: { type: Number, default: 0 },
      minimumOrderAmount: { type: Number, default: 1 },
      maximumUseCount: { type: Number, default: -1 },
      maximumUsePerCustomer: { type: Number, default: 1 },
      validityStart: Date,
      validityEnd: Date,
    },
  ],
});

const ProductModel = model<ProductAttributes>('Product', productSchema);

export default ProductModel;
