import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Document } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse } from '../../../../utils/helpers';
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
      ? await PurchaseModel.find(query, null, paginate.queryOptions)
          .populate('Partner', 'name')
          .populate('Receiver', 'name avatar')
          .populate('Product', 'name photo')
          .lean()
      : await PurchaseModel.find(query, null, paginate.queryOptions)
          .populate('Partner', 'name')
          .populate('Receiver', 'name avatar')
          .populate('Product', 'name description')
          .lean();

    if (purchaseId && receivedPifs.length) {
      return handleResponse(res, { data: receivedPifs[0] });
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
