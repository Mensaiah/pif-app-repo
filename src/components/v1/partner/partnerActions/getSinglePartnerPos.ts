import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerPosModel } from '../../discountCode/partnerPos/partnerPost.model';
import { PartnerModel } from '../partner.model';

const getSinglePartnerPos = async (req: IRequest, res: Response) => {
  const { partnerId, partnerPosId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

  try {
    const partner = await PartnerModel.findById(partnerId);

    if (!partner) return handleResponse(res, 'Partner does not exist', 404);

    if (
      !isUserTopLevelAdmin &&
      !hasAccessToMarketplaces(req, partner.marketplaces)
    )
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    if (userType === 'partner-admin' && !hasAccessToPartner(req, partner._id))
      return handleResponse(
        res,
        "You don't have the permission to perform this operation.",
        403
      );

    const partnerPos = await PartnerPosModel.findOne({
      _id: partnerPosId,
      Partner: partnerId,
    });

    return handleResponse(res, { data: partnerPos });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};

export default getSinglePartnerPos;
