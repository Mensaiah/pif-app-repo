import { Document } from 'mongoose';

export interface PartnerAttributes extends Document {
  _id: number;
  name: string;
  email: string;
  marketplaces: string[];
  vat?: string;
  phonePrefix: string;
  phone: string;
  fax?: string;
  website?: string;
  isCharity?: boolean;
  logo?: string;
  adminEmail?: string;
  adminName?: string;
  headquarter: {
    country: string;
    city: string;
    zipCode: string;
    address: string;
  };
  paymentDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    country: string;
    currency: string;
  };
  settlingDetails: {
    isPeriodically?: boolean;
    periodType?: 'daily' | 'weekly' | 'monthly';
    isAmountThreshold?: boolean;
    amountThreshold?: string;
    startProportion?: string;
    finishProportion?: string;
    pifProportion?: string;
    fixedFee?: string;
    enableTransactionFeeManualSettings?: boolean;
    transactionAmount?: string;
    transactionMaximumAmount?: string;
  };
  redeemType:
    | 'mobile-redemption'
    | 'unique-codes-offline-with-confirmation'
    | 'unique-codes-offline-without-confirmation'
    | 'non-unique-codes-offline';

  status: 'active' | 'inactive' | 'not-verified';
  enableRewardSystem?: boolean;
  ftpHost?: string;
  ftpLogin?: string;
  ftpPass?: string;
  ftpLastSync?: string;
  apiLogin?: string;
  apiPass?: string;
  apiCodeType?: string;
  logoCropData?: { scd?: string; sd?: string };
  contractDocuments?: Array<{
    filename: string;
    source: string;
    deletedAt?: Date;
  }>;
  rolesAndPermissions: Array<{
    role: string;
    permissions: string[];
  }>;
}
