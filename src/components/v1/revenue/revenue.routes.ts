import { Router } from 'express';

import {
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { getRevenueList } from './revenue.actions';

const router = Router();

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['transactions.view']),
  getRevenueList
);

router.get(
  '/:revenueId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['transactions.view']),
  getRevenueList
);

export default router;
