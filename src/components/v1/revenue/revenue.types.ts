import { Document, ObjectId } from 'mongoose';

export interface RevenueAttributes extends Document {
  revenueFrom: 'pifProportion' | 'fixedFee' | 'pifExpiry';
  amount: number;
  currency: number;
  marketplace: string;
  Partner: ObjectId;
  Product: ObjectId;
  User: ObjectId;
  Purchase: ObjectId;
  Transaction: ObjectId;
}
