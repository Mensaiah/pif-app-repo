import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { PayoutModel } from '../payout.model';
import { finalizePayoutSchema } from '../payout.policy';

export const finalizePayout = async (req: IRequest, res: Response) => {
  try {
    const { items, payoutId }: z.infer<typeof finalizePayoutSchema> = req.body;

    const payout = await PayoutModel.findById(payoutId);
    const partnerPayouts = await Promise.all(
      items.map((id) => PayoutModel.findById(id))
    );
  } catch (err) {
    handleResponse(res, 'Internal server error', 500, err);
  }
};
