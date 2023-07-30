import { ObjectId } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';
import { PaymentDriverType } from '../platform/platform.types';

export interface TransactionAttributes {
  User: ObjectId;
  amount: number;
  txFee: number;
  currency: string;
  driver: PaymentDriverType;
  method: string;
  marketplace: string;
  Purchases: ObjectId[];
  PaymentRecord: ObjectId;
}

export interface PaymentRecordAttributes {
  idempotencyKey: string;
  User: ObjectId;
  amount: number;
  currency: string;
  driver: PaymentDriverType;
  method: string; // TODO: card, bank, mobile
  marketplace: string;
  txFee: number;
  items: Array<{
    Partner: ObjectId;
    Product: ObjectId;
    productName: LanguageValuePair[];
    productPhoto: string;
    unitPrice: number;
    quantity: number;
    amount: number;
    discountCode: string;
    isCharity: boolean;
  }>;
  senderPifId: string;
  recipientPifId: string;
  recipientPhonePrefix: string;
  recipientPhoneNumber: string;
  Contact?: ObjectId;
  message: string;
  toBeDeliveredAt: Date;
  history: Array<{
    event: string;
    data: string; // paystack payment link or stripe payment intent id
    happenedAt: Date;
    comment?: string;
  }>;
  status: 'pending' | 'successful' | 'failed';
  driverRefernce: string;
  isOrderProcessed: boolean;
}
