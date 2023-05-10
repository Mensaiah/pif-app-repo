import { Schema, model } from 'mongoose';
import { PartnerPosUserAttributes, UserAttributes } from './user.types';
import { ObjectId } from 'bson';
import appConfig from 'src/config';

const userSchema = new Schema<UserAttributes>(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    timezone: String,
    Partner: {
      type: ObjectId,
      ref: 'Partner',
    },
    userType: {
      type: String,
      enum: ['customer', 'admin', 'partner-admin'],
      required: true,
    },
    username: String,
    pifId: String,
    avatar: String,
    sex: String,
    dob: Date,
    occupation: String,
    relationship: {
      type: String,
      enum: ['married', 'single', 'divorced', 'prefer not to say'],
    },
    hasChildren: Boolean,
    interests: [String],
    contact: {
      phone: { type: String, required: true },
      phonePrefix: { type: String, required: true },
      city: String,
      zip: String,
      street: String,
      country: String,
    },
    socials: [
      {
        platformName: { type: String, required: true },
        socialUserId: { type: String, required: true },
      },
    ],
    kickbackPoints: [{ marketplace: String, points: Number }],
    rewardSystemPoints: [],
    paymentConfigs: {
      paymentMethods: [
        {
          name: String,
          token: String,
          driver: String,
          method: String,
        },
      ],
      netAxeptPaymentMethods: [
        {
          name: String,
          issuer: String,
          expiryDate: String,
          panHash: String,
        },
      ],
      stripeCustomerId: String,
      stripeConnectCustomerId: String,
      stripePaymentMethods: [
        {
          name: String,
          issuer: String,
          expiryDate: Date,
          panHash: String,
        },
      ],
    },
    favoriteProducts: [
      {
        type: ObjectId,
        ref: 'Product',
      },
    ],
    isConfirmed: Boolean,
    isSignupComplete: Boolean,
    currentMarketplace: String,
    lastSelectedPartnerId: { type: ObjectId, ref: 'Partner' },
    configs: {
      notificationEnabled: Boolean,
      hasRatedPlaystoreApp: Boolean,
      hasRatedAppstoreApp: Boolean,
      locale: { type: String, enum: appConfig.supportedLanguages },
      skip_sms: Boolean,
    },
    termsAccepted: [
      {
        termId: { type: ObjectId, ref: 'LegalPolicy', required: true },
        acceptedAt: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);
const partnerPosUserSchema = new Schema<PartnerPosUserAttributes>({
  Partner: { type: ObjectId, ref: 'Partner', required: true },
  name: { type: String, required: true },
  isActive: Boolean,
});

export const UserModel = model<UserAttributes>('User', userSchema);
export const PartnerPosUserModel = model<PartnerPosUserAttributes>(
  'PartnerPosUser',
  partnerPosUserSchema
);
