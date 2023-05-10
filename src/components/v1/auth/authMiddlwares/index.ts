import { Response, NextFunction } from 'express';
import { IRequest, IToken } from 'src/types/global';
import { handleResponse } from 'src/utils/helpers';
import { useWord } from 'src/utils/wordSheet';
import jwt from 'jsonwebtoken';
import appConfig from 'src/config';

export { default as requireAuthMiddleware } from './requireAuth';

export const validateTokenMiddleware = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;
  if (!token) return next();

  try {
    const decoded: IToken = jwt.verify(
      token,
      appConfig.authConfigs.jwtSecret
    ) as IToken;

    req.decoded = decoded;

    return next();
  } catch (err) {
    if (err.name) {
      if (err.name === 'JsonWebTokenError') {
        return handleResponse(res, 'invalid token', 401);
      } else if (err.name === 'TokenExpiredError') {
        return handleResponse(res, useWord('expiredToken', req.lang), 401, err);
      }
    }
  }
};
