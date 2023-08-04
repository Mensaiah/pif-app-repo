import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Document } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse } from '../../../../utils/helpers';
import PurchaseModel from '../purchase.model';
import { PurchaseAttributes } from '../purchase.types';

export const getSentPifs = async (req: IRequest, res: Response) => {
  const paginate = handlePaginate(req);
  const { purchaseId } = req.params;

  const { user } = req;

  try {
    const query: FilterQuery<PurchaseAttributes & Document> = {
      User: user._id,
      ...(purchaseId && { _id: purchaseId }),
    };
    const sentPifs = await PurchaseModel.find(
      query,
      null,
      paginate.queryOptions
    )
      .populate('Partner', 'name')
      .lean();

    if (purchaseId && sentPifs.length) {
      return handleResponse(res, { data: sentPifs[0] });
    }

    const count = await PurchaseModel.countDocuments(query);

    return handleResponse(res, {
      data: sentPifs,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    return handleResponse(res, 'error getting sent pifs', 500, err);
  }
};
