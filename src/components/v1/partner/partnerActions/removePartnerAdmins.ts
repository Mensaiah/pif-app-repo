import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { PartnerModel } from '../partner.model';
import { checkPartnerAccess } from '../partner.utils';

const removePartnerAdmins = async (req: IRequest, res: Response) => {
  const { partnerId, adminId } = req.params;

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
