import { Schema, Types, model } from 'mongoose';

import platformConstants from '../../../config/platformConstants';

import { SettlementAttributes } from './settlement.types';

const settlementSchema = new Schema<SettlementAttributes>({
  old_id: Number,
  isLegacyData: Boolean,
  amount: Number,
  currency: String,
  settlementType: {
    type: String,
    enum: ['start', 'end'],
  },
  Purchase: {
    type: Types.ObjectId,
    ref: 'Purchase',
  },
  Product: {
    type: Types.ObjectId,
    ref: 'Product',
  },
  Transaction: {
    type: Types.ObjectId,
    ref: 'Transaction',
  },
  Partner: {
    type: Types.ObjectId,
    ref: 'Partner',
  },
  paymentInfo: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    payWith: {
      type: String,
      enum: platformConstants.paymentProcessors,
    },
  },
  isSettled: {
    type: Boolean,
    default: true,
  },
  marketplace: String,
});

const SettlementModel = model<SettlementAttributes>(
  'Settlement',
  settlementSchema
);

export default SettlementModel;
