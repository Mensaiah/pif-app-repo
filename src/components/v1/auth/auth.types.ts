import { ObjectId } from 'mongoose';

import { PermissionCapabilities } from '../../../config/rolesAndPermissions';

export interface UserAccessAttributes {
  User?: ObjectId;
  PartnerPosUser?: ObjectId;
  pin?: string; // hashedPin
  password?: string; // hashedPassword
  securityCode?: string;
  rolesAndPermissions: {
    role: string;
    permissions: (PermissionCapabilities | 'supreme')[];
  }[];
  markeplaces?: Array<string>;
  isBlocked?: boolean;
  lastLoginAttempt?: Date | null;
  lastLoginAt?: Date;
  lastEventTime?: Date;
  failedLoginAttempts: number;
  sessions: Array<UserSessionAttributes>;

  // methods
  comparePassword(password: string): boolean;
  comparePin(pin: string): boolean;
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
  purpose: 'signup' | 'pass-reset';
  expiresAt: Date;
  phone: string;
  phonePrefix: string;
  isConfirmed: boolean;
  lastSent: Date;
}
