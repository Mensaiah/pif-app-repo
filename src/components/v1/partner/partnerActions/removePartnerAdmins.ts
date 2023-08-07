import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import {
  hasAccessToMarketplaces,
  hasAccessToPartner,
} from '../../../../utils/queryHelpers/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { PartnerModel } from '../partner.model';

const removePartnerAdmins = async (req: IRequest, res: Response) => {
  const { partnerId, adminId } = req.params;

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

    const partnerToBeDeleted = await UserModel.findOne({
      _id: adminId,
      Partner: partnerId,
    });

    partnerToBeDeleted.name = 'deleted_user';
    partnerToBeDeleted.email = null;
    partnerToBeDeleted.avatar = null;
    partnerToBeDeleted.deletedAt = new Date();

    await partnerToBeDeleted.save();

    return handleResponse(res, 'Partner deleted successfully', 204);
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default removePartnerAdmins;
