import { Document, ObjectId } from 'mongoose';

export interface ContactAttributes extends Document {
  old_id?: number;
  isLegacyData?: boolean;
  User: ObjectId;
  pifId?: string;
  name: string;
  phoneNumber: string;
  phoneNumberDisplay: string;
  hasApp: boolean;
  deletedAt?: Date;
  countryCode?: string;
}
