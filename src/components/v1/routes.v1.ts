import { Router } from 'express';

import { IRequest } from '../../types/global';
import { handleResponse } from '../../utils/helpers';
import { useWord } from '../../utils/wordSheet';

import authRoutesV1 from './auth/auth.routes';
import userRoutesV1 from './user/user.routes';

const router = Router();

// Routes for different components
router.use('/auth', authRoutesV1);
router.use('/user', userRoutesV1);

// Add more routes for other components here.
// router.use('/accounts', accountRoutesV1);
// router.use('/permissions', permissionRoutesV1);
// router.use('/roles', roleRoutesV1);
// router.use('/suppliers', supplierRoutesV1);
// router.use('/products', productRoutesV1);

router.get('/', (req: IRequest, res) => {
  return handleResponse(res, useWord('welcomeToAPI', req.lang));
});

// const routesV1 = router;
export default router;
