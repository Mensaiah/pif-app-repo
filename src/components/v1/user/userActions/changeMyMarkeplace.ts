import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { capitalize, handleResponse } from '../../../../utils/helpers';

const changeMyMarketplace = async (req: IRequest, res: Response) => {
  const { marketplace } = req.params;
  const myUserData = req.user;

  if (req.userType !== 'customer') {
    return handleResponse(
      res,
      'You are not authorized to perform this operation',
      401
    );
  }

  if (
    'currentMarketplace' in myUserData &&
    myUserData.currentMarketplace === marketplace
  ) {
    return handleResponse(res, 'You are already in this marketplace', 400);
  }

  try {
    if ('currentMarketplace' in myUserData) {
      myUserData.currentMarketplace = marketplace;
      await myUserData.save();

      return handleResponse(res, {
        message: `Your marketplace has now been set to ${capitalize(
          marketplace
        )})}`,
        data: {
          name: myUserData.name,
          email: myUserData.email,
          pifId: myUserData.pifId,
          timezone: myUserData.timezone,
          userType: myUserData.userType,
          avatar: myUserData.avatar,
          contact: myUserData.contact,
          socials: myUserData.socials,
          currentMarketplace: marketplace,
        },
      });
    } else {
      return handleResponse(res, 'Invalid request', 401);
    }
  } catch (err) {
    return handleResponse(
      res,
      'An error occurred while trying to change your marketplace',
      500,
      err
    );
  }
};

export default changeMyMarketplace;
