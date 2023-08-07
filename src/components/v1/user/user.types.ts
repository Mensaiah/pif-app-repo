import { ObjectId } from 'mongoose';

import { LanguageCode } from '../../../types/global';

export type UserType = 'customer' | 'platform-admin' | 'partner-admin';

interface Contact {
  fullPhoneNumber?: string;
  phonePrefix?: string;
  phone?: string;
  city?: string;
  zip?: string;
  street?: string;
  country?: string;
}

interface Social {
  platformName: string;
  socialUserId: string;
}

export interface UserAttributes {
  old_id?: number;
  isLegacyData?: boolean;
  name?: string;
  email?: string;
  timezone?: string;
  Partner?: ObjectId;
  userType: UserType;
  pifId?: string;
  avatar?: string;
  sex?: 'male' | 'female' | 'others' | 'prefer-not-to-say';
  dob?: Date;
  occupation?: string;
  relationship?: 'married' | 'single' | 'divorced' | 'prefer not to say';
  hasChildren?: boolean;
  interests?: string[];
  contact?: Contact;
  socials?: Array<Social>;
  kickbackPoints?: Array<{ marketplace: string; points: number }>;
  rewardSystemPoints?: [];
  paymentConfigs?: {
    paymentMethods?: Array<{
      name: string;
      token: string;
      driver: string;
      method: string;
      paymentGateway: string;
      signature: string;
      issuer: string;
      expiryDate: Date;
      panHash: string;
    }>;
    stripeCustomerId?: string;
    stripeConnectCustomerId?: string;
  };
  favoriteProducts?: Array<ObjectId>;
  isConfirmed?: boolean;
  shouldEnforceConfirmation?: boolean;
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
  old_id: number;
  isLegacyData: boolean;
  Partner: ObjectId;
  name: string;
  avatar?: string;
  isActive: boolean;
  timezone: string;
  email?: string;
  dob: Date;
  sex?: 'male' | 'female' | 'others' | 'prefer-not-to-say';
  contact?: Pick<Contact, 'phonePrefix' | 'phone'>;
  Pos: ObjectId;
  isConfirmed?: boolean;
  shouldEnforceConfirmation?: boolean;
}

export interface UserInviteAttributes {
  code: string;
  userType: Exclude<UserType, 'customer'>;
  role: string;
  email: string;
  invitedBy: ObjectId;
  marketplaces?: string[];
  Partner?: ObjectId;
  PartnerPos?: ObjectId;
  City?: ObjectId;
  Pos?: ObjectId;
  expiresAt?: Date;
  lastSent?: Date;
  status: 'pending' | 'accepted';
}
