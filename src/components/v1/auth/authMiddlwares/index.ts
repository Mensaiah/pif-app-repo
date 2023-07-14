import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import appConfig from '../../../../config';
import { IRequest, IToken } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';

export { default as requireAuthMiddleware } from './requireAuth';

export const validateTokenMiddleware = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let token = (req.headers['x-access-token'] ||
    req.headers.authorization) as string;
  token = token?.replace('Bearer ', '');

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

export const hasAnyPermissionMiddleware =
  (requiredPermissions: string[]) =>
  (req: IRequest, res: Response, next: NextFunction) => {
    if (req.userType === 'customer')
      return handleResponse(res, 'Forbidden', 403);

    const { permissions } = req.userAccess;

    if (!permissions || !permissions.length)
      return handleResponse(
        res,
        'You do not have permission to perform this operation',
        403
      );

    const hasPermission =
      permissions.includes('supreme') ||
      requiredPermissions.some((permission) =>
        permissions.includes(permission)
      );

    if (!hasPermission)
      return handleResponse(
        res,
        'You do not have permission to perform this operation',
        403
      );

    return next();
  };

export const hasAllPermissionsMiddleware =
  (requiredPermissions: string[]) =>
  (req: IRequest, res: Response, next: NextFunction) => {
    if (req.userType === 'customer')
      return handleResponse(res, 'Forbidden', 403);

    const { permissions } = req.userAccess;

    if (!permissions || !permissions.length)
      return handleResponse(
        res,
        'You do not have permission to perform this operation',
        403
      );

    const hasPermission =
      permissions.includes('supreme') &&
      requiredPermissions.every((permission) =>
        permissions.includes(permission)
      );

    if (!hasPermission)
      return handleResponse(
        res,
        'You do not have permission to perform this operation',
        403
      );

    return next();
  };

export const cannotBeCustomerMiddleware = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userType === 'customer') return handleResponse(res, 'Forbidden', 403);

  return next();
};

export const mustBePlatformAdminMiddleware = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userType !== 'platform-admin')
    return handleResponse(res, 'Forbidden', 403);

  return next();
};
