import { ObjectId } from 'bson';
import { Schema, model } from 'mongoose';

import appConfig from '../../../config';

import {
  UserInviteAttributes,
  PartnerPosUserAttributes,
  UserAttributes,
} from './user.types';

const userSchema = new Schema<UserAttributes>(
  {
    old_id: Number,
    isLegacyData: Boolean,
    name: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    timezone: String,
    Partner: {
      type: ObjectId,
      ref: 'Partner',
    },
    userType: {
      type: String,
      required: true,
    },
    pifId: String,
    avatar: String,
    sex: {
      type: String,
      enum: ['male', 'female', 'others', 'prefer-not-to-say'],
    },
    dob: Date,
    occupation: String,
    relationship: {
      type: String,
      enum: ['married', 'single', 'divorced', 'prefer-not-to-say'],
    },
    hasChildren: Boolean,
    interests: [String],
    contact: {
      phone: { type: String },
      phonePrefix: { type: String },
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
          paymentGateway: String,
          signature: String,
          issuer: String,
          expiryDate: Date,
          panHash: String,
        },
      ],
      stripeCustomerId: String,
      stripeConnectCustomerId: String,
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
  old_id: Number,
  isLegacyData: Boolean,
  Partner: { type: ObjectId, ref: 'Partner', required: true },
  name: { type: String, required: true },
  avatar: String,
  isActive: Boolean,
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  timezone: String,
  dob: Date,
  sex: {
    type: String,
    enum: ['male', 'female', 'others', 'prefer-not-to-say'],
  },
  contact: {
    phone: String,
    phonePrefix: String,
  },
  Pos: { type: ObjectId, ref: 'Pos', required: true },
});

export const UserModel = model<UserAttributes>('User', userSchema);

export const PartnerPosUserModel = model<PartnerPosUserAttributes>(
  'PartnerPosUser',
  partnerPosUserSchema
);

export const UserInviteSchema = new Schema<UserInviteAttributes>({
  code: { type: String, required: true },
  role: { type: String, required: true },
  userType: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true, required: true },
  invitedBy: { type: ObjectId, ref: 'User' },
  Partner: { type: ObjectId, ref: 'Partner' },
  marketplaces: [String],
  City: { type: ObjectId, ref: 'City' },
  Pos: { type: ObjectId, ref: 'Pos' },
  expiresAt: Date,
  lastSent: Date,
  status: String,
});

export const UserInviteModel = model<UserInviteAttributes>(
  'UserInvite',
  UserInviteSchema
);
