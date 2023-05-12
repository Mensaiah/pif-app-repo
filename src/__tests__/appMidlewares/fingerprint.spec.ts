import { Response } from 'express';
import geoip from 'geoip-lite';

import fingerprintMiddleware, {
  GeoInfo,
  FingerprintResult,
} from '../../appMiddlewares/fingerprint.middleware';
import { IRequest } from '../../types/global';

jest.mock('geoip-lite');

describe('fingerprintMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate a fingerprint based on request properties', async () => {
    (geoip.lookup as jest.Mock).mockReturnValue({
      range: [134744072, 134744319],
      country: 'US',
      region: 'CA',
      timezone: 'America/Los_Angeles',
      city: 'San Fransisco',
      ll: [37.7749, -122.4149],
      metro: 807,
      area: 0,
    } as GeoInfo);

    const req = {
      headers: {
        'user-agent': 'test-user-agent',
        accept: 'test/accept',
        'accept-language': 'en-US,en;q=0.9',
      },
      ip: '8.8.8.8',
    } as unknown as IRequest;

    const res = {} as Response;
    const next = jest.fn();

    fingerprintMiddleware(req, res, next);

    const fingerprint: FingerprintResult = req.fingerprint;
    expect(fingerprint).toBeDefined();
    expect(fingerprint.hash).toHaveLength(64);

    const { components } = fingerprint;
    expect(components.userAgent).toBe('test-user-agent');
    expect(components.language).toBe('en-US,en;q=0.9');
    expect(components.ip).toBe('8.8.8.8');
    expect(components.geo.country).toBe('US');
    expect(components.geo.region).toBe('CA');
    expect(components.geo.timezone).toBe('America/Los_Angeles');

    expect(next).toHaveBeenCalled();
  });
});
