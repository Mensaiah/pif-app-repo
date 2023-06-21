import { Document, Types } from 'mongoose';

export interface RevenueAttributes extends Document {
  revenueFrom: 'pifProportion' | 'fixedFee';
  amount: number;
  currency: number;
  marketplace: string;
  Partner: number;
  Product: Types.ObjectId;
  User: Types.ObjectId;
  Purchase: Types.ObjectId;
}
