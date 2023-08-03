import { NextFunction, Request, Response } from 'express';

import appConfig from '../config';

import { isArray } from './validators';

const httpRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = new Date().getTime();
  const requestTimestamp = new Date().toISOString();

  res.on('finish', () => {
    const endTime = new Date().getTime();
    const responseTimestamp = new Date().toISOString();
    const responseTime = endTime - startTime;
    const responseSize = res.get('content-length') || 0;

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const clientIpAddress =
      clientIp && isArray(clientIp)
        ? (clientIp as string[]).join('|')
        : clientIp;

    let logMessage = `
${req.method} ${req.url} - ${res.statusCode}
Response Time: ${responseTime}ms
Client IP: ${clientIpAddress as string}
User Agent: ${userAgent}
Request Timestamp: ${requestTimestamp}
Response Timestamp: ${responseTimestamp}
Response Size: ${responseSize}`;

    if (appConfig.isDev) {
      logMessage += `
Request Headers: ${JSON.stringify(req.headers)}
Request Query Params: ${JSON.stringify(req.query)}
Request Body: ${JSON.stringify(req.body)}`;
    }
  });

  next();
};

module.exports = httpRequestLogger;
export default httpRequestLogger;
