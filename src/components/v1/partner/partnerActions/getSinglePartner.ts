import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse, _omit } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../partner.model';

const getSinglePartner = async (req: IRequest, res: Response) => {
  const { partnerId } = req.params;

  try {
    const partner = await PartnerModel.findById(partnerId);

    if (!partner) return handleResponse(res, 'Partner does not exist', 404);

    return handleResponse(res, {
      data: _omit(partner.toObject(), [
        'rolesAndPermissions',
        'contractDocuments',
      ]),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getSinglePartner;
