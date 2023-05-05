import { Router } from 'express';
import { doDashboardLogin, doMobileLogin } from './auth.actions';
import policyMiddleware from 'src/appMiddlewares/policy.middleware';
import { dashLoginSchema, mobileLoginSchema } from './auth.policy';

const router = Router();

router.post('/login', policyMiddleware(dashLoginSchema), doDashboardLogin);
router.post('/m-login', policyMiddleware(mobileLoginSchema), doMobileLogin);

export default router;
