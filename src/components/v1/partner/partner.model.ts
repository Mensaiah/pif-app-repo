import { Schema, model } from 'mongoose';

import { PartnerAttributes } from './partner.types';

const partnerSchema = new Schema<PartnerAttributes>(
  {
    old_id: Number,
    isLegacyData: Boolean,
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
      notifyEmail: String,
    },
    settlingDetails: {
      isPeriodically: Boolean,
      periodType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      isAmountThreshold: Boolean,
      amountThreshold: Number,
      startProportion: String,
      finishProportion: String,
      pifProportion: String,
      fixedFee: String,
      enableTransactionFeeManualSettings: Boolean,
      transactionAmount: String,
      transactionMaximumAmount: String,
      transactionFee: Number,
      transactionFeeValue: Number,
      settlingType: Number,
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
    logoCropData: {
      scd: {
        left: Number,
        top: Number,
        width: Number,
        height: Number,
        naturalWidth: Number,
        naturalHeight: Number,
      },
      sd: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        rotate: Number,
        scaleX: Number,
        scaleY: Number,
      },
    },
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

// partnerSchema.pre<PartnerAttributes & Document>('save', async function (next) {
//   try {
//     const platform = await PlatformModel.findOneAndUpdate(
//       {},
//       {
//         $inc: { 'numericIdTrackers.lastPartnerId': 1 },
//       },
//       { new: true }
//     );
//     this._id = platform.numericIdTrackers.lastPartnerId;
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// });

export const PartnerModel = model<PartnerAttributes>('Partner', partnerSchema);
