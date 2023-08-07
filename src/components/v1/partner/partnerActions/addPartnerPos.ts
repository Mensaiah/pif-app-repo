import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { addPartnerPosSchema } from '../../partnerPos/partnerPos.policy';
import { PartnerPosModel } from '../../partnerPos/partnerPost.model';
import { PartnerModel } from '../partner.model';

const addPartnerPos = async (req: IRequest, res: Response) => {
  const { isUserTopLevelAdmin, userType } = req;

  type addPartnerPosDataType = z.infer<typeof addPartnerPosSchema>;

  const {
    name,
    phone,
    phonePrefix,
    city,
    description,
    geoScanned,
    lat,
    long,
  }: addPartnerPosDataType = req.body;

  const { partnerId } = req.params;

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
      name,
    });

    if (existingPartnerPos)
      return handleResponse(res, 'This partner pos already exists', 409);

    const newPartnerPos = await new PartnerPosModel({
      name,
      phone,
      phonePrefix,
      lat,
      long,
      City: city,
      description,
      geoScanned,
      Partner: partner._id,
    }).save();

    return handleResponse(
      res,
      { message: 'new partner pos added successfully', data: newPartnerPos },
      201
    );
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500);
  }
};

export default addPartnerPos;
