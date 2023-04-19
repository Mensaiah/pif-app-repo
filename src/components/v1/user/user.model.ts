import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from './user.types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving to database
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Compare password with hashed password
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = model<IUser>('User', userSchema);

export default User;
