import { Request } from 'express';
import { Document, Types } from 'mongoose';

import { FingerprintResult } from '../appMiddlewares/fingerprint.middleware';
import { UserAccessAttributes } from '../components/v1/auth/auth.types';
import { UserType } from '../components/v1/user/user.types';
import appConfig from '../config';

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
