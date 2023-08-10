import { Schema, model } from 'mongoose';

import DiscountCodeAttributes, {
  DiscountCodeUsageAttributes,
} from './discountCode.types';

const discountCodeSchema = new Schema<DiscountCodeAttributes>(
  {
    Product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountType: {
      type: String,
      enum: ['fixed', 'percentage'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    useCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    minimumOrderAmount: {
      type: Number,
      default: 1,
    },
    maximumUseCount: {
      type: Number,
      default: -1,
    },
    maximumUsePerCustomer: {
      type: Number,
      default: 1,
    },
    validityStart: {
      type: Date,
      required: true,
    },
    validityEnd: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const DiscountCodeModel = model<DiscountCodeAttributes>(
  'DiscountCode',
  discountCodeSchema
);

const discountCodeUsageSchema = new Schema<DiscountCodeUsageAttributes>(
  {
    DiscountCode: {
      type: Schema.Types.ObjectId,
      ref: 'DiscountCode',
    },
    User: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    Product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    code: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      default: 0,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    Transaction: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    Purchase: {
      type: Schema.Types.ObjectId,
      ref: 'Purchase',
    },
  },
  { timestamps: true }
);

const DiscountCodeUsageModel = model<DiscountCodeUsageAttributes>(
  'DiscountCodeUsage',
  discountCodeUsageSchema
);

export { DiscountCodeUsageModel };

export default DiscountCodeModel;
