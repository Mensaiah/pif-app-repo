import { Document, ObjectId } from 'mongoose';

import platformConstants from '../../../config/platformConstants';
import { PaymentDriverType } from '../platform/platform.types';

export interface SettlementAttributes extends Document {
  old_id: number;
  isLegacyData: boolean;
  amount: number;
  currency: string;
  settlementType: 'start' | 'end';
  Purchase: ObjectId;
  Product: ObjectId;
  Transaction: ObjectId;
  isSettled: boolean;
  paymentInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    payWith: PaymentDriverType;
  };
}
