import { Document, ObjectId } from 'mongoose';

export interface ContactAttributes extends Document {
  User: ObjectId;
  username?: string;
  pifId?: string;
  name: string;
  phoneNumber: string;
  phoneNumberDisplay: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
