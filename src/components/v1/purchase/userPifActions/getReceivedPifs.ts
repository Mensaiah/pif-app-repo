import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Document } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse } from '../../../../utils/helpers';
import { PartnerPosModel } from '../../discountCode/partnerPos/partnerPost.model';
import PurchaseModel from '../purchase.model';
import { PurchaseAttributes } from '../purchase.types';

export const getReceivedPifs = async (req: IRequest, res: Response) => {
  const paginate = handlePaginate(req);
  const { purchaseId } = req.params;

  const { user, pifId } = req;

  try {
    const query: FilterQuery<PurchaseAttributes & Document> = {
      $or: [
        {
          recipientPhonePrefix: user.contact.phonePrefix,
          recipientPhoneNumber: user.contact.phone,
        },
        {
          recipientPifId: pifId,
        },
      ],
      ...(purchaseId && { _id: purchaseId }),
    };

    const receivedPifs = purchaseId
      ? await PurchaseModel.findOne(query, null, paginate.queryOptions)
          .populate([
            {
              path: 'Partner',
              select: 'name headquarter phonePrefix phone logo',
            },
            { path: 'Receiver', select: 'name avatar' },
            { path: 'Product', select: 'description' },
          ])
          .lean()
      : await PurchaseModel.find(query, null, paginate.queryOptions)
          .populate([
            { path: 'Partner', select: 'name' },
            { path: 'Receiver', select: 'name avatar' },
          ])
          .lean();

    if (purchaseId) {
      if (!receivedPifs) return handleResponse(res, 'Purchase not found', 404);

      const receivedPif = receivedPifs;

      const posLocations = await PartnerPosModel.find({
        Partner: (receivedPif as any).Partner?._id,
      });
      if (posLocations.length)
        (receivedPif as any).Partner.posLocations = posLocations;

      return handleResponse(res, { data: receivedPif });
    }

    const count = await PurchaseModel.countDocuments(query);

    return handleResponse(res, {
      data: receivedPifs,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(res, 'error getting received pifs', 500, err);
  }
};
