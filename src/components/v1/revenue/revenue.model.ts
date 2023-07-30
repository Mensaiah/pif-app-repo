import { Schema, Types, model } from 'mongoose';

import { RevenueAttributes } from './revenue.types';

const revenueSchema = new Schema<RevenueAttributes & Document>({
  revenueFrom: {
    type: String,
    enum: ['pifProportion', 'fixedFee', 'pifExpiry'],
  },
  amount: Number,
  currency: String,
  marketplace: String,
  Partner: { type: Types.ObjectId, ref: 'Partner' },
  Product: { type: Types.ObjectId, ref: 'Product' },
  User: { type: Types.ObjectId, ref: 'User' },
  Purchase: { type: Types.ObjectId, ref: 'Purchase' },
  Transaction: { type: Types.ObjectId, ref: 'Transaction' },
});

const RevenueModel = model<RevenueAttributes>('Revenue', revenueSchema);

export default RevenueModel;
