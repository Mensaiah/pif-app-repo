import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse } from '../../../../utils/helpers';
import {
  getMarketplaceQuery,
  getPartnerQuery,
  handleReqSearch,
} from '../../../../utils/queryHelpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserInviteModel } from '../user.model';
import { UserInviteAttributes } from '../user.types';

const getUserInvites = async (req: IRequest, res: Response) => {
  const {
    user_type: userType,
    status,
    partner_id,
    marketplace,
  } = handleReqSearch(req, {
    user_type: 'string',
    partner_id: 'string',
    marketplace: 'string',
    status: 'string',
  });

  const paginate = handlePaginate(req);

  try {
    const marketplaceQuery = getMarketplaceQuery(req, marketplace);
    const partnerQuery = await getPartnerQuery(req, partner_id);

    if (req.sendEmptyData) return handleResponse(res, { data: [] });

    const query: FilterQuery<UserInviteAttributes & Document> = {
      ...(marketplaceQuery?.marketplace && {
        marketplaces: marketplaceQuery?.marketplace,
      }),
      ...partnerQuery,
      ...(status && { status }),
      ...(userType && { userType }),
    };

    const userInvites = await UserInviteModel.find(
      query,
      null,
      paginate.queryOptions
    )
      .populate('Partner', 'name')
      .populate('invitedBy', 'name')
      .lean();

    const count = await UserInviteModel.countDocuments(query);

    return handleResponse(res, {
      data: userInvites,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getUserInvites;
