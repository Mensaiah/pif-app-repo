import { ObjectId } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';

export interface PurchaseAttributes {
  old_id: number;
  isLegacyData: boolean;
  User: ObjectId;
  Receiver: ObjectId;
  Partner: ObjectId;
  Product: ObjectId;
  productName: LanguageValuePair[];
  productPhoto: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  txFee: number;
  currency: string;
  netAmount: number;
  rewardSystemPoints: number;
  priceStart: number;
  priceFinish: number;
  pifIncome: number;
  SettlementStart: ObjectId;
  SettlementFinish: ObjectId;
  startSettlementPaidAt?: Date;
  finishSettlementPaidAt?: Date;
  Revenue: ObjectId;
  proportion: {
    proportionStart: number;
    proportionFinish: number;
    proportionPif: number;
    fixedFee: number;
  };
  senderPifId: string;
  recipientPifId: string;
  recipientPhonePrefix: string;
  recipientPhoneNumber: string;
  Contact?: ObjectId;
  message: string;
  code?: string;
  discountCode?: string;
  codeType?:
    | 'alpha_num'
    | 'code128'
    | 'qr_code'
    | 'upc'
    | 'ean8'
    | 'ean13'
    | 'isbn';
  marketplace: string;
  Transaction: ObjectId;
  unwrapedAt: Date;
  redeemedAt: Date;
  apiRedepemptionProcessedAt: Date;
  apiRedemptionUserConfirmAt: Date;
  expiresBy: Date;
  hideValidationCodeAt: Date;
  isDelayed: boolean;
  deliveryAt: string;
  isCharity: boolean;
  expiryNotifyAt: Date;
  pifHistory: Array<{
    from: string; // pifId
    to: string; // pifId or full phone number
    recipientPhonePrefix?: string;
    recipientPhoneNumber?: string;
    message: string;
  }>;
}
