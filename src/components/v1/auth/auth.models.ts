import bcrypt from 'bcrypt';
import { Document, Schema, model } from 'mongoose';

import { permissions } from '../../../config/rolesAndPermissions';

import { OtpAttributes, UserAccessAttributes } from './auth.types';

const roleAndPermissionSchema = new Schema(
  {
    role: String,
    permissions: [
      {
        type: String,
        enum: [...permissions.map((p) => p.capabilities).flat(), 'supreme'],
      },
    ],
  },
  { _id: false }
);
const userAccessSchema = new Schema<UserAccessAttributes>({
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
  rolesAndPermissions: [roleAndPermissionSchema],
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
});

userAccessSchema.path('rolesAndPermissions').schema.set('autoIndex', false);

// Hash password before saving to database
userAccessSchema.pre<UserAccessAttributes & Document>(
  'save',
  async function (next) {
    try {
      if (!this.isModified('password') && !this.isModified('pin'))
        return next();

      const salt = await bcrypt.genSalt(10);

      if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
      }
      if (this.isModified('pin')) {
        const hashedPin = await bcrypt.hash(this.pin, salt);
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
  return bcrypt.compareSync(password, this.password);
};
// Compare pin with hashed pin
userAccessSchema.methods.comparePin = function (pin: string): boolean {
  return bcrypt.compareSync(pin, this.pin);
};

export const UserAccessModel = model<UserAccessAttributes>(
  'UserAccess',
  userAccessSchema
);

// OTP
const OtpCodeSchema = new Schema<OtpAttributes>({
  code: String,
  purpose: {
    type: String,
    enum: ['signup', 'pass-reset'],
  },
  expiresAt: Date,
  phone: String,
  phonePrefix: String,
  isConfirmed: Boolean,
  lastSent: Date,
});
export const OtpCodeModel = model<OtpAttributes>('OtpCode', OtpCodeSchema);