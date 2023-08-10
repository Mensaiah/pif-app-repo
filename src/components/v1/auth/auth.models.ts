import bcrypt from 'bcrypt';
import { Document, Schema, model } from 'mongoose';
import ms from 'ms';

import appConfig from '../../../config';
import platformConstants from '../../../config/platformConstants';

import { OtpAttributes, UserAccessAttributes } from './auth.types';

const userAccessSchema = new Schema<UserAccessAttributes & Document>(
  {
    old_id: Number,
    isLegacyData: Boolean,
    isLegacyAccountValidated: Boolean,
    User: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    PartnerPosUser: {
      type: Schema.Types.ObjectId,
      ref: 'PartnerPosUser',
    },
    pin: String,
    password: String,
    securityCode: String,
    role: String,
    permissions: [String],
    marketplaces: [
      {
        type: String,
      },
    ],
    citiesCovered: [Schema.Types.ObjectId],
    isBlocked: Boolean,
    lastLoginAttempt: Date,
    lastLoginAt: Date,
    lastEventTime: Date,
    failedLoginAttempts: { type: Number, required: true },
    sessions: [
      {
        required: true,
        type: {
          used: { type: Number, required: true },
          sessionId: { type: String, required: true },
          deviceHash: { type: String, required: true },
          lastEventTime: { type: Date, required: true },
          maxLivespan: { type: Number, required: true },
          maxInactivity: { type: Number, required: true },
          isLoggedOut: Boolean,
          device: {
            info: String,
            geoip: {
              lat: String,
              long: String,
            },
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving to database
userAccessSchema.pre<UserAccessAttributes & Document>(
  'save',
  async function (next) {
    try {
      if (this.isLegacyData && !this.isLegacyAccountValidated) return next();
      if (!this.isModified('password') && !this.isModified('pin'))
        return next();

      const salt = await bcrypt.genSalt(10);

      if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(
          this.password + appConfig.authConfigs.hashPepper,
          salt
        );
        this.password = hashedPassword;
      }

      if (this.isModified('pin') && !this.isLegacyData) {
        const hashedPin = await bcrypt.hash(
          this.pin + appConfig.authConfigs.hashPepper,
          salt
        );
        this.pin = hashedPin;
      }

      return next();
    } catch (error) {
      return next(error);
    }
  }
);

// Compare password with hashed password
userAccessSchema.methods.comparePassword = function (
  password: string
): boolean {
  const isLegacyData = this.isLegacyData;
  const isLegacyAccountValidated = this.isLegacyAccountValidated;
  const hashPepper = appConfig.authConfigs.hashPepper;

  const passwordString =
    isLegacyData && !isLegacyAccountValidated
      ? password
      : password + hashPepper;

  return bcrypt.compareSync(
    passwordString,
    this.password.replace(/^\$2y/, '$2b')
  );
};
// Compare pin with hashed pin
userAccessSchema.methods.comparePin = function (pin: string): boolean {
  const isLegacyData = this.isLegacyData;
  const isLegacyAccountValidated = this.isLegacyAccountValidated;
  const hashPepper = appConfig.authConfigs.hashPepper;

  const pinString =
    isLegacyData && !isLegacyAccountValidated ? pin : pin + hashPepper;

  return bcrypt.compareSync(
    pinString,
    this.pin?.replace(/^\$2y/, '$2b') // replace $2y with $2b for bcrypt to work
  );
};
// updatePassword
userAccessSchema.methods.updatePassword = function (password: string): void {
  const isLegacyData = this.isLegacyData;
  const isLegacyAccountValidated = this.isLegacyAccountValidated;

  if (isLegacyData && !isLegacyAccountValidated) {
    this.isLegacyAccountValidated = true;
  }
  this.password = password;
};
// updatePin
userAccessSchema.methods.updatePin = function (pin: string): void {
  const isLegacyData = this.isLegacyData;
  const isLegacyAccountValidated = this.isLegacyAccountValidated;

  if (isLegacyData && !isLegacyAccountValidated) {
    this.isLegacyAccountValidated = true;
  }
  this.pin = pin;
};

export const UserAccessModel = model<UserAccessAttributes>(
  'UserAccess',
  userAccessSchema
);

// OTP
const OtpCodeSchema = new Schema<OtpAttributes>(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    code: String,
    purpose: {
      type: String,
      enum: platformConstants.otpPurpose,
    },
    expiresAt: Date,
    phone: String,
    phonePrefix: String,
    isConfirmed: Boolean,
    lastSent: Date,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    isDeleted: Boolean,
  },
  { timestamps: true }
);

OtpCodeSchema.pre<OtpAttributes & Document>('save', function (next) {
  if (!this.isModified('code')) return next();

  this.expiresAt = new Date(Date.now() + ms('15 mins'));

  return next();
});

export const OtpCodeModel = model<OtpAttributes>('OtpCode', OtpCodeSchema);
