import { Request } from 'express';
import { Document, ObjectId } from 'mongoose';
import appConfig from '../config';
import { UserType } from 'src/components/v1/user/user.types';
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
  userId?: ObjectId;
  fingerprint?: FingerprintResult;
  paginationData?: IPaginationData;
  decoded?: any;
  role?: string;
  userType?: UserType;
  permissions?: string[];
}
