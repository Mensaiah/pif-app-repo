import { Schema, model } from 'mongoose';
import { Document } from 'mongoose';

import PlatformModel from '../platform/platform.model';

import { PartnerAttribute } from './partner.types';

const partnerSchema = new Schema<PartnerAttribute>(
  {
    _id: Number,
    name: String,
    email: {
      type: String,
      lowercase: true,
    },

    marketplaces: [String],
    vat: String,
    phonePrefix: String,
    phone: String,
    fax: String,
    website: String,
    isCharity: Boolean,
    logo: String,
    adminEmail: String,
    adminName: String,
    headquarter: {
      country: String,
      city: String,
      zipCode: String,
      address: String,
    },
    paymentDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      country: String,
      currency: String,
    },
    settlingDetails: {
      isPeriodically: Boolean,
      periodType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      isAmountThreshold: Boolean,
      amountThreshold: String,
      startProportion: String,
      finishProportion: String,
      pifProportion: String,
      fixedFee: String,
      enableTransactionFeeManualSettings: Boolean,
      transactionAmount: String,
      transactionMaximumAmount: String,
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
    status: {
      type: String,
      enum: ['active', 'inactive', 'not-verified'],
    },
    enableRewardSystem: Boolean,
    ftpHost: String,
    ftpLogin: String,
    ftpPass: String,
    ftpLastSync: String,
    apiLogin: String,
    apiPass: String,
    apiCodeType: String,
    logoCropData: { scd: String, sd: String },
    contractDocuments: [
      {
        filename: String,
        source: String,
        deletedAt: Date,
      },
    ],

    rolesAndPermissions: [{ role: String, permissions: [String] }],
  },
  { timestamps: true }
);

partnerSchema.pre<PartnerAttribute & Document>('save', async function (next) {
  try {
    const platform = await PlatformModel.findOneAndUpdate(
      {},
      {
        $inc: { 'numericIdTrackers.lastPartnerId': 1 },
      },
      { new: true }
    );
    this._id = platform.numericIdTrackers.lastPartnerId;
    return next();
  } catch (err) {
    return next(err);
  }
});

export const PartnerModel = model<PartnerAttribute>('Partner', partnerSchema);
