import { Document, ObjectId } from 'mongoose';
import { UserAttributes } from '../user/user.types';

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
