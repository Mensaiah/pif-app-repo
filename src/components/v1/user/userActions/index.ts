import { Response } from 'express';
import validator from 'validator';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { UserModel } from '../user.model';

export { default as createPlatformInvite } from './createPlatformInvite';
export { default as verifyPlatformInvite } from './verifyPlatformInvite';
export { default as acceptPlatformInvite } from './acceptPlatformInvite';
export { default as changeMyMarketplace } from './changeMyMarkeplace';

export { getMyProfile, updateMyProfile } from './userProfileActions';

export const verifyPifId = async (req: IRequest, res: Response) => {
  let { pifId } = req.params;
  pifId = validator.blacklist(pifId, '<>[]\\/{}="');

  try {
    const idExists = await UserModel.countDocuments({
      pifId: pifId,
    });

    return handleResponse(res, {
      exists: idExists > 0,
    });
  } catch (err) {
    handleResponse(
      res,
      'An error occurred while trying to verify your PIF ID',
      500,
      err
    );
  }
};
