import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { updatePartnerPosSchema } from '../../discountCode/partnerPos/partnerPos.policy';
import { PartnerPosModel } from '../../discountCode/partnerPos/partnerPost.model';
import { PartnerModel } from '../partner.model';

const updatePartnerPos = async (req: IRequest, res: Response) => {
  const { isUserTopLevelAdmin, userType } = req;

  type updatePartnerPosDataType = z.infer<typeof updatePartnerPosSchema>;

  const {
    name,
    phone,
    phonePrefix,
    city,
    description,
    geoScanned,
    lat,
    long,
  }: updatePartnerPosDataType = req.body;

  const { partnerId, partnerPosId } = req.params;

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
      Partner: partnerId,
    });

    if (
      !existingPartnerPos ||
      existingPartnerPos.name === 'deleted_partner_pos'
    )
      return handleResponse(res, 'This partner pos does not exist', 404);

    if (name) existingPartnerPos.name = name;
    if (phone) existingPartnerPos.phone = phone;
    if (phonePrefix) existingPartnerPos.phonePrefix = phonePrefix;
    if (lat) existingPartnerPos.lat = lat;
    if (long) existingPartnerPos.long = long;
    if (city) existingPartnerPos.City = city;
    if (description) existingPartnerPos.description = description;
    if (geoScanned) existingPartnerPos.geoScanned = geoScanned;

    await existingPartnerPos.save();

    return handleResponse(res, {
      message: 'partner pos updated successfully',
      data: existingPartnerPos,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};

export default updatePartnerPos;
