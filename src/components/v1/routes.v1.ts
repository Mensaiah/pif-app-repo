import { Router } from 'express';

import { IRequest } from '../../types/global';
import { handleResponse } from '../../utils/helpers';
import { useWord } from '../../utils/wordSheet';

import authRoutesV1 from './auth/auth.routes';
import categoryRoutesV1 from './category/category.routes';
import cmsRoutesV1 from './cms/cms.routes';
import driveRoutesV1 from './drive/drive.routes';
import partnersRoutesV1 from './partner/partner.routes';
import platformRoutesV1 from './platform/platform.routes';
import productRoutesV1 from './product/product.routes';
import txRoutesV1 from './transaction/transaction.routes';
import uploadRoutesV1 from './upload/upload.routes';
import userRoutesV1 from './user/user.routes';

const router = Router();

// Routes for different components
router.use('/auth', authRoutesV1);
router.use('/users', userRoutesV1);
router.use('/platform', platformRoutesV1);
router.use('/cms', cmsRoutesV1);
router.use('/partners', partnersRoutesV1);
router.use('/uploads', uploadRoutesV1);
router.use('/drive', driveRoutesV1);
router.use('/categories', categoryRoutesV1);
router.use('/products', productRoutesV1);
router.use('/tx', txRoutesV1);

router.get('/', (req: IRequest, res) => {
  return handleResponse(res, useWord('welcomeToAPI', req.lang));
});

const routerV1 = router;
export default routerV1;
