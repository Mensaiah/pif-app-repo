import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import platformConstants from '../../../../config/platformConstants';
import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse, validateObjectId } from '../../../../utils/helpers';
import {
  getMarketplaceQuery,
  handleReqSearch,
} from '../../../../utils/queryHelpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerPayoutModel, PayoutModel } from '../payout.model';
import { PayoutAttributes } from '../payout.types';

export const getPayouts = async (req: IRequest, res: Response) => {
  const { status, marketplace, type, payout_id } = handleReqSearch(req, {
    status: 'string',
    type: 'string',
    marketplace: 'string',
    payout_id: 'string',
  });
  const paginate = handlePaginate(req);

  if (
    (status && !platformConstants.payoutStatuses.includes(status as any)) ||
    (type && !platformConstants.payoutTypes.includes(type as any)) ||
    (payout_id && !validateObjectId(payout_id))
  ) {
    return handleResponse(res, { data: [] });
  }

  const query: FilterQuery<PayoutAttributes & Document> = {
    ...(status && { status }),
    ...(type && { type }),
    ...getMarketplaceQuery(req, marketplace),
    ...(payout_id && { _id: payout_id }),
  };

  try {
    const payoutList = await PayoutModel.find(
      query,
      null,
      paginate.queryOptions
    ).lean();

    if (payout_id) {
      if (!payoutList.length) {
        return handleResponse(res, 'payout not found', 404);
      }
      const payout = payoutList[0];

      const partnerPayouts = await PartnerPayoutModel.find({
        Payout: payout_id,
      })
        .populate('Partner', 'name')
        .populate('InitiatedBy', 'name')
        .populate('items.Purchase');

      return handleResponse(res, {
        data: {
          ...payout,
          partnerPayouts,
        },
      });
    }

    const count = await PayoutModel.countDocuments(query);

    return handleResponse(res, {
      data: payoutList,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
