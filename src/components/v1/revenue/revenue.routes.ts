import { Router } from 'express';

import {
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { getRevenueList } from './revenue.actions';

const router = Router();

router.get('/', validateTokenMiddleware, requireAuthMiddleware, getRevenueList);

export default router;
