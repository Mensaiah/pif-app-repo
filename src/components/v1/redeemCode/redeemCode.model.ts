import { Schema, Types, model } from 'mongoose';

import { RedeemCodeAttributes } from './redeemCode.type';

const redeemCodeSchema = new Schema<RedeemCodeAttributes>(
  {
    Product: { type: Types.ObjectId, ref: 'Product' },
    code: String,
    codeType: {
      type: String,
      enum: ['alpha_num', 'code128', 'qr_code', 'upc', 'ean8', 'ean13', 'isbn'],
    },
    expiredAt: Date,
    usedAt: Date,
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const RedeemCodeModel = model<RedeemCodeAttributes>(
  'RedeemCode',
  redeemCodeSchema
);

export default RedeemCodeModel;
