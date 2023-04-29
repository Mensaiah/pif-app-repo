import { model, Schema } from 'mongoose';
import ms from 'ms';
import { OtpCodeAttributes } from '../user/user.types';
import User from '../user/user.model';

const otpSchema = new Schema<OtpCodeAttributes>(
  {
    code: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    purpose: {
      type: 'string',
      enum: ['accountVerf', 'passReset'],
      required: true,
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

// set code expiry
otpSchema.pre<OtpCodeAttributes>('save', async function (next) {
  if (!this.isModified('code')) return next();
  try {
    // Set expiresAt field to 10 minutes later
    this.expiresAt = new Date(Date.now() + ms('10m'));

    return next();
  } catch (error) {
    return next(error);
  }
});

const OtpCode = model<OtpCodeAttributes>('OtpCode', otpSchema);

export default OtpCode;
