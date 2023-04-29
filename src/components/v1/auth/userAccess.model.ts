import { Document, ObjectId } from 'mongoose';
import { UserAttributes } from '../user/user.types';

export interface UserAccessAttributes extends Document {
  userId: UserAttributes['_id'];
  pin: string; // hashedPin
  password: string;
  roleId?: ObjectId;
  permissions: [];
  isBlocked?: boolean;
  lastLoginAt?: Date;
  lastEventTime: Date;
  failedLoginAttempts: number;
  sessions: Array<UserSessionAttributes>;
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
