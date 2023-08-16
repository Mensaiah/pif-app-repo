import { ObjectId } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handleReqSearch } from '../../../utils/queryHelpers';
import { hasAccessToMarketplaces } from '../../../utils/queryHelpers/helpers';
import { PartnerModel } from '../partner/partner.model';

export const getPartnerId = async (
  req: IRequest
): Promise<{
  success: boolean;
  status?: number;
  message?: string;
  partnerId?: ObjectId;
}> => {
  const { user } = req;

  const { Partner: partnerId } = user;

  const { partner_id } = handleReqSearch(req, {
    partner_id: 'string',
  });

  if (!partnerId && !partner_id)
    return {
      success: false,
      message: 'partner is required',
      status: 400,
    };

  if (partnerId) {
    return { partnerId, success: true };
  }

  try {
    if (!req.isUserTopLevelAdmin) {
      const partner = await PartnerModel.findById(partner_id);
      if (!partner) {
        return {
          success: false,
          message: 'partner does not exist',
          status: 404,
        };
      }
      if (!hasAccessToMarketplaces(req, partner.marketplaces))
        return {
          success: false,
          message: 'forbidden',
          status: 403,
        };
    }

    return {
      partnerId: (partnerId || partner_id) as unknown as ObjectId,
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      message: 'error validating request',
      status: 500,
    };
  }
};
