import { Router } from 'express';

import authRoutesV1 from './auth/auth.routes';
import userRoutesV1 from './user/user.routes';
import { handleResponse } from 'src/utils/helpers';
import { useWord } from 'src/utils/wordSheet';
import { IRequest } from 'src/types/global';

const router = Router();

// Routes for different components
router.use('/auth', authRoutesV1);
router.use('/users', userRoutesV1);

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
