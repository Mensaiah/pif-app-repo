import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  validateRolesMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';
import requireAuth from '../auth/authMiddlwares/requireAuth';

import {
  addFaq,
  addInfo,
  addLegalPolicy,
  getFaq,
  getInfo,
  getLegalPolicy,
  updateFaq,
  updateInfo,
  updateLegalPolicy,
} from './cms.actions';
import {
  addFaqSchema,
  addInfoSchema,
  addLegalPolicySchema,
  updateFaqSchema,
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

router.get(
  '/faq',
  validateTokenMiddleware,
  requireAuth,
  validateRolesMiddleware(['super admin', 'admin'], 'error getting info'),
  getFaq
);

router.post(
  '/faq',
  validateTokenMiddleware,
  requireAuth,
  validateRolesMiddleware(['admin', 'super admin'], 'error adding info'),
  policyMiddleware(addFaqSchema),
  addFaq
);

router.get(
  '/faq/:faqId',
  validateTokenMiddleware,
  requireAuth,
  validateRolesMiddleware(['admin', 'super admin'], 'error adding info'),
  policyMiddleware(updateFaqSchema),
  updateFaq
);

export default router;
