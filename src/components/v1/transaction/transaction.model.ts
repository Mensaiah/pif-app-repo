import { Document, Schema, Types, model } from 'mongoose';

const { ObjectId } = Schema.Types;

import platformConstants from '../../../config/platformConstants';
import { languageValuePairSchema } from '../../../utils/db-helpers';

import {
  PaymentRecordAttributes,
  TransactionAttributes,
} from './transaction.types';

const transactionSchema = new Schema<TransactionAttributes & Document>({
  User: { type: ObjectId, ref: 'User' },
  amount: Number,
  txFee: Number,
  currency: String,
  driver: {
    type: String,
    enum: platformConstants.paymentProcessors,
  },
  method: String,
  marketplace: String,
  Purchases: [{ type: ObjectId, ref: 'Purchase' }],
  PaymentRecord: { type: ObjectId, ref: 'PaymentRecord' },
});

export const TransactionModel = model<TransactionAttributes>(
  'Transaction',
  transactionSchema
);

const paymentRecordSchema = new Schema<PaymentRecordAttributes>({
  idempotencyKey: { type: String, required: true },
  User: { type: ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  driver: {
    type: String,
    required: true,
    enum: platformConstants.paymentProcessors,
  },
  method: String,
  marketplace: { type: String, required: true },
  txFee: Number,
  items: [
    {
      Partner: { type: ObjectId, ref: 'Partner' },
      Product: { type: ObjectId, ref: 'Product' },
      productName: [languageValuePairSchema],
      productPhoto: String,
      unitPrice: Number,
      quantity: Number,
      amount: Number,
      discountCode: String,
      isCharity: Boolean,
    },
  ],
  senderPifId: String,
  recipientPifId: String,
  recipientPhonePrefix: String,
  recipientPhoneNumber: String,
  Contact: { type: ObjectId, ref: 'Contact' },
  message: String,
  toBeDeliveredAt: Date,
  history: [
    {
      event: String,
      data: String, // paystack payment link or stripe payment intent id
      happenedAt: Date,
      comment: String,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending',
  },
  driverRefernce: String,
  isOrderProcessed: Boolean,
});

export const PaymentRecordModel = model<PaymentRecordAttributes>(
  'PaymentRecord',
  paymentRecordSchema
);
