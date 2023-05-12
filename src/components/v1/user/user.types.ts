import { ObjectId } from 'mongoose';

import { LanguageCode } from '../../../types/global';

export type UserType = 'customer' | 'admin' | 'partner-admin';
export interface UserAttributes {
  name?: string;
  email?: string;
  timezone?: string;
  Partner?: ObjectId;
  userType: UserType;
  username?: string;
  pifId?: string;
  avatar?: string;
  sex?: string;
  dob?: Date;
  occupation?: string;
  relationship?: 'married' | 'single' | 'divorced' | 'prefer not to say';
  hasChildren?: boolean;
  interests?: string[];
  contact?: {
    phone: string;
    phonePrefix: string;
    city?: string;
    zip?: string;
    street?: string;
    country?: string;
  };
  socials?: Array<{
    platformName: string;
    socialUserId: string;
  }>;
  kickbackPoints?: Array<{ marketplace: string; points: number }>;
  rewardSystemPoints?: [];
  paymentConfigs?: {
    paymentMethods?: Array<{
      name: string;
      token: string;
      driver: string;
      method: string;
    }>;
    netAxeptPaymentMethods?: Array<{
      name: string;
      issuer: string;
      expiryDate: string;
      panHash: string;
    }>;
    stripeCustomerId?: string;
    stripeConnectCustomerId?: string;
    stripePaymentMethods?: Array<{
      name: string;
      issuer: string;
      expiryDate: Date;
      panHash: string;
    }>;
  };
  favoriteProducts?: Array<ObjectId>;
  isConfirmed?: boolean;
  isSignupComplete?: boolean;
  currentMarketplace?: string;
  lastSelectedPartnerId?: ObjectId;
  configs?: {
    notificationEnabled?: boolean;
    hasRatedPlaystoreApp?: boolean;
    hasRatedAppstoreApp?: boolean;
    locale?: LanguageCode;
    skip_sms?: boolean;
  };
  termsAccepted?: [
    {
      termId: ObjectId;
      acceptedAt: Date;
    }
  ];
  deletedAt?: Date;
}
// contacts, details (UserPifDetails), kickbackPoints, rewardSystemPoints: UserPifRewardSystemPoints, IUserPifProportions (622), PartnerSlicePrices, ProductVouchers, ProductVouchersUses

export interface PartnerPosUserAttributes {
  Partner: ObjectId;
  name: string;
  isActive: boolean;
}
