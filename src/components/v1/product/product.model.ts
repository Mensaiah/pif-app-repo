import { Schema, Types, model } from 'mongoose';

import platformConstants from '../../../config/platformConstants';
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
  redemptionValidityValue: {
    // String or Number
    type: Schema.Types.Mixed,
    validate: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: function (value: any) {
        if (typeof value === 'string') {
          const timestamp = Date.parse(value);
          // check if the string can be converted to a valid date
          if (!isNaN(timestamp)) {
            return true;
          }
        }
        if (typeof value === 'number') {
          // check if the number is positive
          return value > 0;
        }
        return false;
      },
      message: (props) =>
        `Invalid value: ${props.value}! Value should be a valid date string or a positive number.`,
    },
  },
  extraProduct: {
    description: [languageValuePairSchema],
    photo: String,
  },
  redeemType: {
    type: String,
    enum: [
      'mobile-redemption',
      'unique-codes-offline-with-confirmation',
      'unique-codes-offline-without-confirmation',
      'non-unique-codes-offline',
    ],
  },
  validThru: Date,
  quantity: Number,
  qtySold: { type: Number, default: 0 },
  deletedAt: Date,
  version: Number,
  isCurrentVersion: Boolean,
  isLowStock: Boolean,
  originId: Number,
  order: Boolean,
  quantityAlert: { type: Number, default: 0 },
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

const changeStream = ProductModel.watch();

changeStream.on('change', async (change) => {
  // Filter only updates
  if (change.operationType === 'update') {
    // Fetch the updated document
    const product = await ProductModel.findById(change.documentKey._id);

    if (product) {
      // Check if quantityAlert condition is met
      if (
        product.quantity !== platformConstants.unlimited &&
        product.quantity <= product.quantityAlert
      ) {
        product.isLowStock = true;
      } else {
        product.isLowStock = false;
      }

      // save the document with updated isLowStock
      await product.save();
    }
  }
});

export default ProductModel;
