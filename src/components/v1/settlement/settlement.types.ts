import { Document, Types } from 'mongoose';

export interface SettlementAttributes extends Document {
  totalAmount: number;
  currency: string;
  proportionStart: number | null;
  proportionEnd: number | null;
  Purchase: Types.ObjectId;
  Product: Types.ObjectId;
  status: 'pending' | 'ready' | 'paid' | 'canceled';
  settledBy: Types.ObjectId | 'system';
  paymentInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    paidWith: 'manual transfer' | 'paystack';
    paidAt: Date;
  };
}
