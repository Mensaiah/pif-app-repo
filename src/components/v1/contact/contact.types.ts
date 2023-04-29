import { Document, ObjectId } from 'mongoose';

export interface ContactAttributes extends Document {
  userId: ObjectId;
  username?: string;
  name: string;
  phoneNumber: string;
  phoneNumberDisplay: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
