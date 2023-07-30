import { Document, ObjectId } from 'mongoose';

export interface PartnerAttributes extends Document {
  old_id?: number;
  isLegacyData?: boolean;
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
  productCategories: Array<ObjectId>;
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
    amountThreshold?: number;
    startProportion?: number;
    finishProportion?: number;
    pifProportion?: number;
    fixedFee?: number;
    enableTransactionFeeManualSettings?: boolean;
    transactionAmount?: number;
    transactionMaximumAmount?: number;
    transactionFee: number;
    transactionFeeValue: number;
    settlingType: number;
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
  logoCropData?: {
    scd: {
      left: number;
      top: number;
      width: number;
      height: number;
      naturalWidth: number;
      naturalHeight: number;
    };
    sd: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotate: number;
      scaleX: number;
      scaleY: number;
    };
  };
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
