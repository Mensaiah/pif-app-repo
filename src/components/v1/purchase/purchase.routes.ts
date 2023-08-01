import { Router } from 'express';

import { getPurchases } from './purchase.action';

const router = Router();

router.get('/', getPurchases);

export default router;
