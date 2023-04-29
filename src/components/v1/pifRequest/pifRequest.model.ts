import { Document, ObjectId } from 'mongoose';
import { UserAttributes } from '../user/user.types';
import { ContactAttributes } from '../contact/contact.types';

export interface PifRequestAttributes extends Document {
  User: UserAttributes['_id'];
  Product: ObjectId;
  Contact: ContactAttributes['_id'];
  quantity: number;
  Recipient?: UserAttributes['_id'];
  recipientPhonePrefix: string;
  recipientPhoneNumber: string;
  message: string;
  acceptedAt: Date;
}
