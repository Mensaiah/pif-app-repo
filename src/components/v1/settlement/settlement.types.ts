import { Document } from 'mongoose';
import { UserAttributes } from '../user/user.types';
import { PurchaseAttributes } from '../purchase/purchase.types';
import { ProductAttributes } from '../product/product.types';

export interface SettlementAttributes extends Document {
  totalAmount: number;
  currency: string;
  proportionStart: number | null;
  proportionEnd: number | null;
  Purchase: PurchaseAttributes['_id'];
  Product: ProductAttributes['_id'];
  status: 'pending' | 'ready' | 'paid' | 'canceled';
  settledBy: UserAttributes['_id'] | 'system';
  paymentInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    paidWith: 'manual transfer' | 'paystack';
    paidAt: Date;
  };
}
