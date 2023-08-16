import { ObjectId } from 'mongoose';

import platformConstants from '../../../config/platformConstants';

export interface PaidTo {
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountType: string;
  paidBy: string;
  paidAt: Date;
}

export interface PartnerPayoutAttributes {
  Payout: ObjectId;
  Partner: ObjectId;
  amount: number;
  status: (typeof platformConstants.partnerPayoutStatuses)[number];
  paidTo?: PaidTo;
  items: Array<{
    Purchase: ObjectId;
    type: (typeof platformConstants.partnerPayoutItemTypes)[number];
  }>;
}

export interface PayoutAttributes {
  amount: number;
  marketplace: string;
  currency: string;
  status: (typeof platformConstants.payoutStatuses)[number];
  payoutType: (typeof platformConstants.payoutTypes)[number];
  InitiatedBy?: ObjectId;
  finalizedBy?: ObjectId;
}
