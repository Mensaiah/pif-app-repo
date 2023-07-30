import { Schema, model, Types } from 'mongoose';

import {
  PushMessageAttributes,
  SmsMessageAttributes,
} from './notification.types';

const PushMessageSchema = new Schema<PushMessageAttributes>({
  criteria: Schema.Types.Mixed,
  message: {
    type: String,
    required: true,
  },
  numberOfRecipients: {
    type: Number,
    required: true,
  },
  sender: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: function (v: any) {
        return typeof v === 'string'
          ? v === 'system'
          : Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid sender!`,
    },
    default: 'system',
  },
  Partner: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  publishedAt: Date,
});

export const PushMessageModel = model<PushMessageAttributes>(
  'PushMessage',
  PushMessageSchema
);

const smsMessageSchema = new Schema<SmsMessageAttributes>({
  criteria: Schema.Types.Mixed,
  message: {
    type: String,
    required: true,
  },

  receiver: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.Mixed,
    required: false,
    validate: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: function (v: any) {
        return typeof v === 'string'
          ? v === 'system'
          : Types.ObjectId.isValid(v);
      },
    },
    default: 'system',
  },
  type: {
    type: String,
    required: false,
    enum: ['automatic', 'manual'],
    default: 'manual',
  },
  status: {
    type: String,
    required: false,
    enum: ['sent', 'delivered', 'failed', 'queued'],
    default: 'queued',
  },
  gateway: {
    type: String,
    required: false,
    enum: ['infobip', 'twilio'],
    default: 'infobip',
  },
  sentAt: Date,
});

export const SmsMessageModel = model<SmsMessageAttributes>(
  'SmsMessage',
  smsMessageSchema
);
