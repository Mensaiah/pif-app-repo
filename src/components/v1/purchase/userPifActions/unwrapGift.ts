import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Document } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import PurchaseModel from '../purchase.model';
import { PurchaseAttributes } from '../purchase.types';

export const unwrapGift = async (req: IRequest, res: Response) => {
  const { purchaseId } = req.params;

  const { user, pifId } = req;

  try {
    const orConditions = [
      {
        recipientPhonePrefix: user.contact.phonePrefix,
        recipientPhoneNumber: user.contact.phone,
      },
    ] as FilterQuery<PurchaseAttributes & Document>['$or'];

    if (pifId) {
      orConditions.push({ recipientPifId: pifId });
    }

    const query: FilterQuery<PurchaseAttributes & Document> = {
      _id: purchaseId,
      $or: orConditions,
    };

    let receivedPif = await PurchaseModel.findOne(query).populate(
      'Partner',
      'name'
    );

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
