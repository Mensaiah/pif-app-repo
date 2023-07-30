import { Types } from 'mongoose';

export interface PushMessageAttributes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  criteria: any;
  message: string;
  numberOfRecipients: number;
  sender: Types.ObjectId | string;
  Partner?: Types.ObjectId;
  publishedAt?: Date;
}

export interface SmsMessageAttributes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  criteria?: any;
  message: string;
  receiver: string;
  sender?: Types.ObjectId | 'system';
  type?: 'automatic' | 'manual';
  status?: 'sent' | 'delivered' | 'failed' | 'queued';
  gateway?: 'infobip' | 'twilio';
  sentAt?: Date;
}
