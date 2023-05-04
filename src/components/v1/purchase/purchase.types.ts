import { Document, ObjectId } from 'mongoose';
import { UserAttributes } from '../user/user.types';
import { ContactAttributes } from '../contact/contact.types';

export interface PurchaseAttributes extends Document {
  User: UserAttributes['_id'];
  Product: ObjectId;
  username: string;
  Partner: ObjectId;
  Contact?: ContactAttributes['_id'];
  Recipient?: UserAttributes['_id'];
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
  SettlementsDetailsStart: ObjectId;
  SettlementsDetailsFinish: ObjectId;
  unwrapedAt: Date;
  redeemedAt: Date;
  apiRedeemedProcessAt: Date;
  apiRedeemedUserConfirmAt: Date;
  expiredAt: Date;
  hideValidationCodeAt: Date;
  Pos: ObjectId;
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
