import { Document, Types } from 'mongoose';

export interface TransactionAttributes extends Document {
  User: Types.ObjectId;
  price: number;
  currency: number;
  driver: string;
  method: string;
  marketplace: string;
}
