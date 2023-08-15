import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';

export const updateOneSignalPlayerId = async (req: IRequest, res: Response) => {
  const { playerId } = req.body;

  if (!playerId) {
    return handleResponse(res, 'playerId is required', 400);
  }

  const { user } = req;

  try {
    user.oneSignalPlayerId = playerId;
    await user.save();

    return handleResponse(res, 'playerId updated successfully');
  } catch (err) {
    handleResponse(res, 'Error updating playerId', 500, err);
  }
};
