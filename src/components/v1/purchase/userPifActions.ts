import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Document } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handlePaginate } from '../../../utils/handlePaginate';
import { handleResponse } from '../../../utils/helpers';

import PurchaseModel from './purchase.model';
import { PurchaseAttributes } from './purchase.types';

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

export const getReceivedPifs = async (req: IRequest, res: Response) => {
  const paginate = handlePaginate(req);
  const { purchaseId } = req.params;

  const { user } = req;

  try {
    const query: FilterQuery<PurchaseAttributes & Document> = {
      recipientPhonePrefix: user.contact.phonePrefix,
      recipientPhoneNumber: user.contact.phone,
      ...(purchaseId && { _id: purchaseId }),
    };

    const receivedPifs = await PurchaseModel.find(
      query,
      null,
      paginate.queryOptions
    )
      .populate('Partner', 'name')
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

export const unwrapGift = async (req: IRequest, res: Response) => {
  const { purchaseId } = req.params;

  const { user } = req;

  try {
    const orConditions = [
      {
        recipientPhonePrefix: user.contact.phonePrefix,
        recipientPhoneNumber: user.contact.phone,
      },
    ] as FilterQuery<PurchaseAttributes & Document>['$or'];

    if ('pifId' in user) {
      orConditions.push({ recipientPifId: user.pifId });
    }

    const query: FilterQuery<PurchaseAttributes & Document> = {
      _id: purchaseId,
      $or: orConditions,
    };

    let receivedPif = await PurchaseModel.findOne(query);

    if (!receivedPif) {
      return handleResponse(res, 'not found', 404);
    }

    if (receivedPif.unwrapedAt) {
      return handleResponse(res, 'pif has already been unwrapped', 200);
    }

    receivedPif.unwrapedAt = new Date();
    receivedPif = await receivedPif.save();

    return handleResponse(res, {
      message: 'Unwrapped successfully',
      data: receivedPif,
    });
  } catch (err) {
    handleResponse(res, 'error unwrapping gift', 500, err);
  }
};
// export const redeemGift = async (req: IRequest, res: Response) => {};
// export const passOnGift = async (req: IRequest, res: Response) => {};
