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

const setPartnerPosInactive = async (req: IRequest, res: Response) => {
  const { partnerId, partnerPosId } = req.params;

  const { isUserTopLevelAdmin, userType } = req;

  //who can activate and deactivate product

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

    const existingPartnerPos = await PartnerPosModel.findOne({
      _id: partnerPosId,
      Partner: partner._id,
    });

    if (
      !existingPartnerPos ||
      existingPartnerPos.name === 'deleted_partner_pos'
    )
      return handleResponse(res, 'Partner pos does not exist', 404);

    existingPartnerPos.isActive = false;

    await existingPartnerPos.save();

    return handleResponse(
      res,
      {
        message: 'partner pos activated successfully',
        data: existingPartnerPos,
      },
      201
    );
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};

export default setPartnerPosInactive;
