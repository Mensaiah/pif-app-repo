import { Document, ObjectId, Types } from 'mongoose';

export interface PurchaseAttributes extends Document {
  User: Types.ObjectId;
  Product: ObjectId;
  username: string;
  Partner: ObjectId;
  Contact?: Types.ObjectId;
  Recipient?: Types.ObjectId;
  recipientPhonePrefix: string;
  recipientPhoneNumber: string;
  Transaction: ObjectId;
  marketplace: string;
  transactionFee: number;
  rewardSystemPoints: number;
  price: number;
  priceStart: number;
  priceFinish: number;
  message: string;
  code: string;
  codeType: string;
  SettlementsDetailsStart: Types.ObjectId;
  SettlementsDetailsFinish: Types.ObjectId;
  unwrapedAt: Date;
  redeemedAt: Date;
  apiRedeemedProcessAt: Date;
  apiRedeemedUserConfirmAt: Date;
  expiredAt: Date;
  hideValidationCodeAt: Date;
  Pos: Types.ObjectId;
  shareNetworks?: string;
  criteriaId: number;
  sent: boolean;
  fixedFee: number;
  proportion: {
    proportionStart: number;
    proportionFinish: number;
    proportionPif: number;
    fixedFee: number;
  };
  isPasson: boolean;
  isDelayed: boolean;
  deliveryAt: string;
  isCharity: boolean;
  settlementsStartStatus: boolean;
  settlementsFinishStatus: boolean;
  expiryNotifyAt: Date;
  pifHistory: Array<{
    from: string; // username
    to: string;
    message: string;
  }>;
}
