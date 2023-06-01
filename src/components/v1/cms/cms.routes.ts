import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import { validateTokenMiddleware } from '../auth/authMiddlwares';
import requireAuth from '../auth/authMiddlwares/requireAuth';

import {
  addInfo,
  addLegalPolicy,
  getInfo,
  getLegalPolicy,
  updateInfo,
  updateLegalPolicy,
} from './cms.actions';
import {
  addInfoSchema,
  addLegalPolicySchema,
  updateInfoSchema,
  updateLegalPolicySchema,
} from './cms.policy';

const router = Router();

router.get('/info', getInfo);
router.get('/info/:infoId', getInfo);
router.post(
  '/info',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(addInfoSchema),
  addInfo
);
router.patch(
  '/info/:infoId',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(updateInfoSchema),
  updateInfo
);

router.get('/policies', getLegalPolicy);
router.get('/policies/:policyId', getLegalPolicy);
router.post(
  '/policies',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(addLegalPolicySchema),
  addLegalPolicy
);
router.patch(
  '/policies/:policyId',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(updateLegalPolicySchema),
  updateLegalPolicy
);

export default router;
