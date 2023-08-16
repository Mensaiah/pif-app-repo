import { Schema, Document, model } from 'mongoose';

import platformConstants from '../../../config/platformConstants';

import { PartnerPayoutAttributes, PayoutAttributes } from './payout.types';

const payoutSchema = new Schema<PayoutAttributes>(
  {
    amount: Number,
    marketplace: String,
    currency: String,
    status: {
      type: String,
      enum: platformConstants.payoutStatuses,
      default: 'pending',
    },
    payoutType: {
      type: String,
      enum: platformConstants.payoutTypes,
      default: 'manual',
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    finalizedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const PayoutModel = model<PayoutAttributes & Document>(
  'Payout',
  payoutSchema
);

const partnerPayoutSchema = new Schema<PartnerPayoutAttributes>(
  {
    Payout: {
      type: Schema.Types.ObjectId,
      ref: 'Payout',
      required: true,
      index: true,
      unique: false,
    },
    Partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: platformConstants.partnerPayoutStatuses,
      default: 'pending',
    },
    paidTo: {
      name: String,
      accountNumber: String,
      bankCode: String,
      bankName: String,
      accountType: String,
      paidBy: String,
      paidAt: Date,
    },
    items: [
      {
        Purchase: { type: Schema.Types.ObjectId, ref: 'Purchase' },
        type: { type: String, enum: platformConstants.partnerPayoutItemTypes },
      },
    ],
  },
  { timestamps: true }
);

export const PartnerPayoutModel = model<PartnerPayoutAttributes & Document>(
  'PartnerPayout',
  partnerPayoutSchema
);
