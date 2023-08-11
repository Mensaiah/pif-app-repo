import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  addBankAccountSchema,
  listBanksSchema,
  resolveBankAccountSchema,
} from './bankInfo.policy';
import {
  addBankAccount,
  listBankAccounts,
  resolveAccountNumber,
} from './bankInfoActions';
import listBanks from './bankInfoActions/listBanks';

const router = Router();

router.get(
  '/list-banks',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(listBanksSchema, 'query'),
  cannotBeCustomerMiddleware,
  listBanks
);

router.post(
  '/resolve-account-number',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(resolveBankAccountSchema),
  cannotBeCustomerMiddleware,
  resolveAccountNumber
);

router.post(
  '/add-account-number',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(addBankAccountSchema),
  cannotBeCustomerMiddleware,
  addBankAccount
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware,
  listBankAccounts
);

export default router;
