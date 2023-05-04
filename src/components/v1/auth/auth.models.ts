import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserAccessAttributes } from './auth.types';
import { permissions } from 'src/config/rolesAndPermissions';

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
  rolesAndPermissions: [
    {
      role: String,
      permissions: {
        type: [
          {
            type: String,
            enum: [...permissions.map((p) => p.capabilities).flat(), 'supreme'],
          },
        ],
        required: true,
      },
    },
  ],
  isBlocked: Boolean,
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
userAccessSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const UserAccessModel = model<UserAccessAttributes>(
  'UserAccess',
  userAccessSchema
);
