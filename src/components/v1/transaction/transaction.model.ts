import { Document } from 'mongoose';
import { UserAttributes } from '../user/user.types';

export interface TransactionAttributes extends Document {
  User: UserAttributes['_id'];
  price: number;
  currency: number;
  driver: string;
  method: string;
  marketplace: string;
}
