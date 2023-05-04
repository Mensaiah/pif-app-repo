import { Document, ObjectId } from 'mongoose';
import { UserAttributes } from '../user/user.types';
import { PurchaseAttributes } from '../purchase/purchase.types';

export interface RewardSystemPointAtrributes extends Document {
  User: UserAttributes['_id'];
  Partner: ObjectId;
  points: number;
  Purchase?: PurchaseAttributes['_id'];
}
