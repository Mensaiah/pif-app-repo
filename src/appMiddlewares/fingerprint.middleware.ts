import { NextFunction, Response } from 'express';
import crypto from 'crypto';
import geoip from 'geoip-lite';
import { IRequest } from 'src/types/global';
import { consoleLog } from 'src/utils/helpers';

export interface GeoInfo {
  range: [number, number];
  country: string;
  region: string;
  timezone: string;
  city: string;
  ll: [number, number];
  metro: number;
  area: number;
}

export interface FingerprintResult {
  hash: string;
  components: {
    userAgent: string;
    language?: string;
    ip: string;
    geo: Partial<GeoInfo>;
  };
}

const fingerprintMiddleware = (
  req: IRequest,
  _res: Response,
  next: NextFunction
) => {
  const userAgent = req.headers['user-agent'] || '';
  const accept = req.headers['accept'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';

  const ipAddress =
    req.ip ||
    req.socket.remoteAddress ||
    ((req.headers['x-forwarded-for'] as string) || '').split(',').pop() ||
    '';

  const geo: Partial<GeoInfo> = geoip.lookup(ipAddress) || {};
  consoleLog({ geo });

  const components = [
    userAgent,
    accept,
    acceptLanguage,
    geo.country,
    geo.region,
    geo.timezone,
    // geo.city,
    // geo.ll?.join(','),
    // geo.metro,
    // geo.area,
  ];

  const fingerprintString = components.join('||');
  const hash = crypto.createHash('sha256');
  hash.update(fingerprintString);
  const fingerprint = hash.digest('hex');

  req.fingerprint = {
    hash: fingerprint,
    components: {
      userAgent: components[0],
      language: components[2],
      ip: ipAddress,
      geo,
    },
  };

  next();
};

export default fingerprintMiddleware;
