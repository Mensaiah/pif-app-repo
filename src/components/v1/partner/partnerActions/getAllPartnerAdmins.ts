import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';

const getAllPartnerAdmins = async (req: IRequest, res: Response) => {
  const { partnerId } = req.params;

  const { user, userType } = req;

  try {
    // TODO: fix this
    const isSupportedUser =
      userType === 'partner-admin'
        ? user.Partner.toString() === partnerId
        : userType === 'platform-admin';

    if (!isSupportedUser) {
      return handleResponse(
        res,
        'You are not authorized to perform this action.',
        403
      );
    }

    const partnerAdmins = await UserModel.find({
      Partner: partnerId,
      userType: { $ne: 'customer' },
      deletedAt: { $exists: false },
    });

    return handleResponse(res, { data: partnerAdmins });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getAllPartnerAdmins;
