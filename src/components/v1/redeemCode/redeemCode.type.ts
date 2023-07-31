import { Document, ObjectId } from 'mongoose';

export type productRedeemCodesType =
  | 'alpha_num'
  | 'code128'
  | 'qr_code'
  | 'upc'
  | 'ean8'
  | 'ean13'
  | 'isbn';

export interface RedeemCodeAttributes extends Document {
  Product: ObjectId;
  code: string | number;
  codeType?: productRedeemCodesType;
  createdAt?: Date;
  expiredAt?: Date;
  usedAt?: Date;
}
