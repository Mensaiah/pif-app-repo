import { Request } from 'express';
import { Document, Types } from 'mongoose';
import appConfig from '../config';
import { UserType } from 'src/components/v1/user/user.types';
import { UserAccessAttributes } from '../components/v1/auth/auth.types';
import { FingerprintResult } from 'src/appMiddlewares/fingerprint.middleware';

export type SupportedLangType = typeof appConfig.supportedLanguages;
export type LanguageCode = SupportedLangType[number];

export type LanguageValuePair = {
  lang: LanguageCode;
  value: string;
};

export interface SessionI {
  used: number;
  sessionId: string;
  deviceHash: string;
  lastEventTime: Date;
  maxLivespan: number | string;
  maxInactivity: number | string;
  isLoggedOut?: boolean;
  device: {
    info: string;
    geoip: {
      lat: string;
      long: string;
    };
  };
}

export interface ISession extends Document, SessionI {}

export type IPaginationData = {
  currentPage: number;
  perPage: number;
  paginationQueryOptions: {
    sort: { _id: -1 };
    skip: number;
    limit: number;
  };
};

export interface IPageMeta {
  totalRows: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
}
export interface IRequest extends Request {
  lang?: LanguageCode;
  userId?: Types.ObjectId;
  fingerprint?: FingerprintResult;
  paginationData?: IPaginationData;
  decoded?: IToken;
  role?: string;
  userType?: UserType | 'pos-user';
  permissions?: string[];
  userAccess: Document & UserAccessAttributes;
}

export interface IToken {
  deviceId: string;
  sessionId: string;
  ref: Types.ObjectId;
  authKey: string;
  userType: UserType | 'pos-user';
}
