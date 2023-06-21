import { Document, ObjectId, Types } from 'mongoose';

import { PurchaseAttributes } from '../purchase/purchase.types';

export interface RewardSystemPointAtrributes extends Document {
  User: Types.ObjectId;
  Partner: number;
  points: number;
  Purchase?: PurchaseAttributes['_id'];
}
