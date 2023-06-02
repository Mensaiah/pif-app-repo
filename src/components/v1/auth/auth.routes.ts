import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';

import {
  dashLoginSchema,
  finalizeMobileSignupSchema,
  forgotPinSchema,
  mobileLoginSchema,
  resetPinSchema,
  mobileSignupSchema,
  resendOTPSchema,
  setPinSchema,
  verifyOTPSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from './auth.policy';
import {
  doDashboardLogin,
  doLogout,
  doForgotPin,
  doMobileLogin,
  doMobileSignup,
  doResetPin,
  doSetPin,
  finalizeMobileSignup,
  resendOtpCode,
  verifyOTPCode,
  doResetPassword,
  doForgotPassword,
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

router.post('/verify-otp', policyMiddleware(verifyOTPSchema), verifyOTPCode);

router.post(
  '/set-pin',
  policyMiddleware(setPinSchema),
  validateTokenMiddleware,
  requireAuthMiddleware,
  doSetPin
);

router.post('/forgot-pin', policyMiddleware(forgotPinSchema), doForgotPin);

router.post('/reset-pin', policyMiddleware(resetPinSchema), doResetPin);

router.post(
  '/forgot-password',
  policyMiddleware(forgotPasswordSchema),
  doForgotPassword
);

router.post(
  '/reset-password',
  policyMiddleware(resetPasswordSchema),
  doResetPassword
);

router.get('/logout', validateTokenMiddleware, requireAuthMiddleware, doLogout);

export default router;
