import { Document, Types } from 'mongoose';

export interface PifRequestAttributes extends Document {
  User: Types.ObjectId;
  Product: Types.ObjectId;
  Contact: Types.ObjectId;
  quantity: number;
  Recipient?: Types.ObjectId;
  recipientPhonePrefix: string;
  recipientPhoneNumber: string;
  message: string;
  acceptedAt: Date;
}
