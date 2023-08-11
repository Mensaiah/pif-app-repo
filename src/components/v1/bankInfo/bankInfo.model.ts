import { Schema, model } from 'mongoose';

import { BankInfoAttributes } from './bankInfo.type';

const bankInfoSchema = new Schema<BankInfoAttributes>(
  {
    Partner: Schema.Types.ObjectId,
    bankName: String,
    bankCode: String,
    country: String,
    currency: String,
    accountName: String,
    accountNumber: String,
  },
  { timestamps: true }
);

const BankInfoModel = model<BankInfoAttributes>('BankInfo', bankInfoSchema);

export default BankInfoModel;
