import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PurchaseModel from '../purchase.model';

export { getPurchases } from './getPurchases';

// TODO: ensure the user is allowed to view that purchase
export const getPurchase = async (req: IRequest, res: Response) => {
  const { purchaseId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;
  try {
    const purchase = await PurchaseModel.findById(purchaseId)
      .populate('SettlementStart')
      .populate('SettlementFinish')
      .populate('Partner', 'name');

    if (!purchase) return handleResponse(res, 'Purchase not found', 404);

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, purchase.marketplace)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    if (
      userType === 'partner-admin' &&
      !hasAccessToPartner(req, purchase.Partner)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    return handleResponse(res, { data: purchase });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
