import { Document, ObjectId } from 'mongoose';

import { PaymentDriverType } from '../platform/platform.types';

export interface SettlementAttributes extends Document {
  old_id: number;
  isLegacyData: boolean;
  amount: number;
  currency: string;
  settlementType: 'start' | 'end';
  Purchase: ObjectId;
  Product: ObjectId;
  Partner: ObjectId;
  Transaction: ObjectId;
  isSettled: boolean;
  paymentInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    payWith: PaymentDriverType;
  };
  marketplace: string;
}
