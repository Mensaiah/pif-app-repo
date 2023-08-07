import { Router } from 'express';

import {
  mustBeCustomerMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { syncContacts } from './contact.actions';

const router = Router();

router.post(
  '/sync',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  syncContacts
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  syncContacts
);

export default router;
