import { ObjectId } from 'mongoose';

export interface BankInfoAttributes {
  Partner: ObjectId;
  bankName: string;
  bankCode: string;
  country: string;
  currency: string;
  accountName: string;
  accountNumber: string;
}
