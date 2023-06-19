import { Router } from 'express';

import { IRequest } from '../../types/global';
import { handleResponse } from '../../utils/helpers';
import { useWord } from '../../utils/wordSheet';

import authRoutesV1 from './auth/auth.routes';
import cmsRoutesV1 from './cms/cms.routes';
import partnersRoutesV1 from './partner/partner.routes';
import platformRoutesV1 from './platform/platform.routes';
import userRoutesV1 from './user/user.routes';
const router = Router();

// Routes for different components
router.use('/auth', authRoutesV1);
router.use('/users', userRoutesV1);
router.use('/platform', platformRoutesV1);
router.use('/cms', cmsRoutesV1);
router.use('/partners', partnersRoutesV1);

router.get('/', (req: IRequest, res) => {
  return handleResponse(res, useWord('welcomeToAPI', req.lang));
});

const routerV1 = router;
export default routerV1;
