import { Schema } from 'mongoose';

import platformConstants from '../../../config/platformConstants';
type ObjectId = Schema.Types.ObjectId;
export interface UserAccessAttributes {
  old_id?: number;
  isLegacyData?: boolean;
  isLegacyAccountValidated?: boolean;
  User?: ObjectId;
  PartnerPosUser?: ObjectId;
  pin?: string; // hashedPin
  password?: string; // hashedPassword
  securityCode?: string;
  role: string;
  citiesCovered: ObjectId[];
  permissions: [string];
  marketplaces?: Array<string>;
  isBlocked?: boolean;
  lastLoginAttempt?: Date | null;
  lastLoginAt?: Date;
  lastEventTime?: Date;
  failedLoginAttempts: number;
  sessions: Array<UserSessionAttributes>;

  // methods
  comparePassword(password: string): boolean;
  comparePin(pin: string): boolean;
  updatePassword(password: string): void;
  updatePin(pin: string): void;
}

export interface UserSessionAttributes {
  used: number;
  sessionId: string;
  deviceHash: string;
  lastEventTime: Date;
  maxLivespan: number;
  maxInactivity: number;
  isLoggedOut?: boolean;
  device: {
    info: string;
    geoip: {
      lat: number | null;
      long: number | null;
    };
  };
}

export interface OtpAttributes {
  code: string;
  purpose: (typeof platformConstants.otpPurpose)[number];
  expiresAt: Date;
  phone: string;
  phonePrefix: string;
  isConfirmed: boolean;
  lastSent: Date;
  email?: string;
  isDeleted?: boolean;
}
