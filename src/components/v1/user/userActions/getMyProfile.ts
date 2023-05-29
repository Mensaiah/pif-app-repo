import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';

const getMyProfile = async (req: IRequest, res: Response) => {
  if (req.userType === 'pos-user') {
    const { Partner, name } = req.user;

    return handleResponse(res, {
      name,
      Partner,
    });
  } else {
    const {
      name,
      email,
      pifId,
      timezone,
      userType,
      avatar,
      contact,
      socials,
      currentMarketplace,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = req.user as any;

    return handleResponse(res, {
      data: {
        name,
        email,
        pifId,
        timezone,
        userType,
        avatar,
        contact,
        socials,
        currentMarketplace,
      },
    });
  }
};
export default getMyProfile;
