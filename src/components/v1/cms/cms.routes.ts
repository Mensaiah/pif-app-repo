import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  hasAnyPermissionMiddleware,
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
  hasAnyPermissionMiddleware(['manage-info', 'add-info']),
  policyMiddleware(addInfoSchema),
  addInfo
);
router.patch(
  '/info/:infoId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['manage-info', 'update-info']),
  policyMiddleware(updateInfoSchema),
  updateInfo
);

router.get('/policies', getLegalPolicy);
router.get('/policies/:policyId', getLegalPolicy);
router.post(
  '/policies',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['manage-policies', 'add-policy']),
  policyMiddleware(addLegalPolicySchema),
  addLegalPolicy
);
router.patch(
  '/policies/:policyId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['manage-policies', 'update-policy']),
  policyMiddleware(updateLegalPolicySchema),
  updateLegalPolicy
);

router.get('/faq', getFaq);
router.get('/faq/:faqId', getFaq);

router.post(
  '/faq',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['manage-faq', 'add-faq']),
  policyMiddleware(addFaqSchema),
  addFaq
);

router.patch(
  '/faq/:faqId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['manage-faq', 'update-faq']),
  policyMiddleware(updateFaqSchema),
  updateFaq
);

export default router;
