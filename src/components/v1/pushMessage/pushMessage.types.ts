import { Document, Types } from 'mongoose';

export interface PushMessageAttributes extends Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  criteria: any;
  message: string;
  numberOfRecipients: number;
  sender: Types.ObjectId | string;
  Partner?: Types.ObjectId;
}
