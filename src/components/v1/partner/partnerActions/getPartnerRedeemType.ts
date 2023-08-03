import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../partner.model';
import { checkPartnerAccess } from '../partner.utils';

const getPartnerRedeemType = async (req: IRequest, res: Response) => {
  const { partnerId } = req.params;

  try {
    const partner = await PartnerModel.findById(partnerId);

    if (!partner) return handleResponse(res, 'Partner does not exist', 404);

    const isSupportedUser = checkPartnerAccess(req, partner);

    if (!isSupportedUser) {
      return handleResponse(
        res,
        'You are not authorized to perform this action.',
        403
      );
    }

    return handleResponse(res, { data: partner.redeemType });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getPartnerRedeemType;
