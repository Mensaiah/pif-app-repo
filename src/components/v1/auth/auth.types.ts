import { ObjectId } from 'mongoose';
import { PermissionCapabilities } from '../../../config/rolesAndPermissions';

export interface UserAccessAttributes {
  User?: ObjectId;
  PartnerPosUser?: ObjectId;
  pin?: string; // hashedPin
  password?: string; // hashedPassword
  rolesAndPermissions: {
    role: string;
    permissions: (PermissionCapabilities | 'supreme')[];
  }[];
  isBlocked?: boolean;
  lastLoginAt?: Date;
  lastEventTime?: Date;
  failedLoginAttempts: number;
  sessions: Array<UserSessionAttributes>;

  comparePassword(password: string): Promise<boolean>;
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
      lat: string;
      long: string;
    };
  };
}

export interface OtpAttributes {
  code: string;
  purpose: 'signup' | 'pass-reset';
  createdAt: Date;
  expiresAt: Date;
  phone: string;
  phonePrefix: string;
  isConfirmed: boolean;
}
