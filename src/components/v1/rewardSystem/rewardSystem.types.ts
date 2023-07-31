import { Document, ObjectId } from 'mongoose';

export interface RewardSystemPointAtrributes extends Document {
  User: ObjectId;
  Partner: ObjectId;
  points: number;
  Purchase?: ObjectId;
}
