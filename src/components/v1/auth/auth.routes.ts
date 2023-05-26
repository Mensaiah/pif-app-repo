import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';

import {
  dashLoginSchema,
  finalizeMobileSignupSchema,
  mobileLoginSchema,
  mobileSignupSchema,
  resendOTPSchema,
  setPinSchema,
  verifyMobileSignupSchema,
} from './auth.policy';
import {
  doDashboardLogin,
  doLogout,
  doMobileLogin,
  doMobileSignup,
  doSetPin,
  finalizeMobileSignup,
  resendOtpCode,
  verifyMobileSignup,
} from './authActions';
import {
  requireAuthMiddleware,
  validateTokenMiddleware,
} from './authMiddlwares';

const router = Router();

router.post('/login', policyMiddleware(dashLoginSchema), doDashboardLogin);
router.post('/m-login', policyMiddleware(mobileLoginSchema), doMobileLogin);
router.post('/m-signup', policyMiddleware(mobileSignupSchema), doMobileSignup);
router.post(
  '/finalize-m-signup',
  policyMiddleware(finalizeMobileSignupSchema),
  finalizeMobileSignup
);
router.post('/resend-otp', policyMiddleware(resendOTPSchema), resendOtpCode);
router.post(
  '/verify-m-signup',
  policyMiddleware(verifyMobileSignupSchema),
  verifyMobileSignup
);
router.post(
  '/m-pin',
  policyMiddleware(setPinSchema),
  validateTokenMiddleware,
  requireAuthMiddleware,
  doSetPin
);

router.get('/logout', validateTokenMiddleware, requireAuthMiddleware, doLogout);

export default router;
