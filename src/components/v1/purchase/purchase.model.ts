import { Schema, model } from 'mongoose';

import { languageValuePairSchema } from '../../../utils/db-helpers';

import { PurchaseAttributes } from './purchase.types';

const purchaseSchema = new Schema<PurchaseAttributes & Document>(
  {
    old_id: Number,
    isLegacyData: Boolean,
    User: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    Receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    Product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
    },
    Partner: {
      type: Schema.Types.ObjectId,
      ref: 'Partner',
      index: true,
    },
    productName: [languageValuePairSchema],
    productPhoto: String,
    unitPrice: Number,
    quantity: Number,
    amount: Number,
    currency: String,
    txFee: Number,
    netAmount: Number,
    rewardSystemPoints: Number,
    priceStart: Number,
    priceFinish: Number,
    pifIncome: Number,
    SettlementStart: {
      type: Schema.Types.ObjectId,
      ref: 'Settlement',
    },
    SettlementFinish: {
      type: Schema.Types.ObjectId,
      ref: 'Settlement',
    },
    startSettlementPaidAt: Date,
    finishSettlementPaidAt: Date,
    Revenue: {
      type: Schema.Types.ObjectId,
      ref: 'Revenue',
    },
    proportion: {
      proportionStart: Number,
      proportionFinish: Number,
      proportionPif: Number,
      fixedFee: Number,
    },
    senderPifId: String,
    recipientPifId: String,
    recipientPhonePrefix: String,
    recipientPhoneNumber: String,
    Contact: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
    },
    message: String,
    code: String,
    discountCode: String,
    codeType: {
      type: String,
      enum: ['alpha_num', 'code128', 'qr_code', 'upc', 'ean8', 'ean13', 'isbn'],
    },
    marketplace: String,
    Transaction: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    unwrapedAt: Date,
    redeemedAt: Date,
    apiRedepemptionProcessedAt: Date,
    apiRedemptionUserConfirmAt: Date,
    expiresBy: Date,
    hideValidationCodeAt: Date,
    isDelayed: Boolean,
    deliveryAt: Date,
    isCharity: Boolean,
    expiryNotifyAt: Date,
    pifHistory: [
      {
        from: String, // pifId
        to: String, // pifId or full phone number
        recipientPhonePrefix: String,
        recipientPhoneNumber: String,
        message: String,
      },
    ],
  },
  { timestamps: true }
);

purchaseSchema.index({ old_id: 1 }, { unique: true, sparse: true });
purchaseSchema.index({
  senderPifId: 'text',
  recipientPifId: 'text',
  recipientPhoneNumber: 'text',
  'productName.value': 'text',
});
purchaseSchema.index({
  marketplace: 1,
  Parner: 1,
  Product: 1,
  User: 1,
  currency: 1,
});

const PurchaseModel = model<PurchaseAttributes>('Purchase', purchaseSchema);

export default PurchaseModel;
