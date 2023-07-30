import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { z } from 'zod';

import { FingerprintResult } from '../appMiddlewares/fingerprint.middleware';
import { UserAccessAttributes } from '../components/v1/auth/auth.types';
import {
  PartnerPosUserAttributes,
  UserAttributes,
  UserType,
} from '../components/v1/user/user.types';
import appConfig from '../config';

export type SupportedLangType = typeof appConfig.supportedLanguages;
export type LanguageCode = SupportedLangType[number];

export type LanguageValuePair = {
  lang: LanguageCode;
  value: string;
};

export const langSchema: Partial<
  Record<SupportedLangType[number], z.ZodOptional<z.ZodString>>
> = {};
appConfig.supportedLanguages.forEach((language) => {
  langSchema[language] = z.string().optional();
});

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
  user?: Document & (UserAttributes | PartnerPosUserAttributes);
  fingerprint?: FingerprintResult;
  paginationData?: IPaginationData;
  decoded?: IToken;
  role?: string;
  userType?: UserType | 'pos-user';
  permissions?: string[];
  userAccess: Document & UserAccessAttributes;
  marketplaces?: string[];
  currentMarketplace?: string;
}

export interface IToken {
  deviceId: string;
  sessionId: string;
  ref: Types.ObjectId;
  role: string;
  authKey: string;
  userType: UserType | 'pos-user';
}

export type langSearchQueryType = { $in: string[] };

export type langSearchType = Record<string, string | langSearchQueryType>;
