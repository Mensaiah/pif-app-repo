import { Document } from 'mongoose';
import { PermissionCapabilities } from '../../../config/rolesAndPermissions';

export interface PartnerAttributes extends Document {
  name: string;
  vat: string;
  country: string;
  marketplace: string;
  isCharity: boolean;
  city: string;
  zipcode: string;
  address: string;
  phonePrefix: string;
  phone: string;
  fax?: string;
  email: string;
  website: string;
  logo: string;
  paymentDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    currency: string;
    country: string;
  };
  settlingDetails: {
    isPeriodically: boolean;
    periodType: 'daily' | 'weekly' | 'monthly';
    amountThreshold: boolean;
    thresholdAmount: number;
    proportionStart: number;
    proportionFinish: number;
    proportionPif: number;
    fixedFee: number;
  };
  status: 'active' | 'inactive' | 'not verified';
  redeemType:
    | 'mobile_redemption'
    | 'unique_code_offline_wt_confirmation'
    | 'non-unique_codes_offline';
  rewardSystemEnabled: boolean;
  ftp_host: string;
  ftp_login: string;
  ftp_pass: string;
  ftp_last_sync: string;
  api_login: string;
  api_pass: string;
  api_code_type: string;
  logoCropData: { scd: string; sd: string };
  contractDocuments?: Array<{
    filename: string;
    source: string;
    deletedAt?: Date;
  }>;
  rolesAndPermissions: Array<{
    role: string;
    permissions: PermissionCapabilities[];
  }>;
}
