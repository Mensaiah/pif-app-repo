import { Document, ObjectId } from 'mongoose';
import { LanguageCode } from 'src/types/global';

export type UserType = 'customer' | 'admin' | 'supplier';
export interface UserAttributes extends Document {
  name: string;
  email: string;
  timezone: string;
  partnerId?: ObjectId;
  userType: UserType;
  username: string;
  avatar?: string;
  sex?: string;
  dob?: Date;
  occupation?: string;
  relationship?: 'married' | 'single' | 'divorced' | 'prefer not to say';
  hasChildren?: boolean;
  interests: string[];
  contact?: {
    prefix: string;
    phoneNumber: string;
    city: string;
    zip: string;
    street: string;
    country: string;
  };
  socials: Array<{
    platformName: string;
    socialUserId: string;
  }>;
  kickbackPoints: Array<{ marketplace: string; points: number }>;
  rewardSystemPoints?: [];
  paymentConfigs: {
    paymentMethods?: Array<{
      name: string;
      token: string;
      driver: string;
      method: string;
    }>;
    netAxeptPaymentMethods: Array<{
      name: string;
      issuer: string;
      expiryDate: string;
      panHash: string;
    }>;
    stripeCustomerId?: string;
    stripeConnectCustomerId?: string;
    stripePaymentMethods: Array<{
      name: string;
      issuer: string;
      expiryDate: Date;
      panHash: string;
    }>;
  };
  favoriteProducts: Array<ObjectId>;
  isConfirmed?: boolean;
  currentMarketplace?: string;
  lastSelectedPartnerId?: ObjectId;
  configs: {
    notificationEnabled: boolean;
    hasRatedApp?: boolean;
    locale: LanguageCode;
    skip_sms?: boolean;
  };
  termsAccepted: [
    {
      termId: ObjectId;
      acceptedAt: Date;
    }
  ];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  comparePassword(password: string): Promise<boolean>;
}
// contacts, details (UserPifDetails), kickbackPoints, rewardSystemPoints: UserPifRewardSystemPoints, IUserPifProportions (622)

export interface OtpCodeAttributes extends Document {
  code: string;
  userId: ObjectId;
  purpose: 'accountVerf' | 'passReset';
  expiresAt?: Date;
}
