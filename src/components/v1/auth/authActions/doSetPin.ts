import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { UserAccessModel } from '../auth.models';
import { setPinSchema } from '../auth.policy';

const doSetPin = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof setPinSchema>;

  const { user, userAccess } = req;

  const { pin }: dataType = req.body;

  const similarAccounts = await UserModel.find({
    _id: { $ne: user._id },
    'contact.phone': user.contact.phone,
    'contact.phonePrefix': user.contact.phonePrefix,
    userType: 'customer',
  });

  let errorMessage = '';
  if (similarAccounts.length) {
    for (let i = 0; i < similarAccounts.length; i++) {
      if (errorMessage) break;
      const accountAccess = await UserAccessModel.findOne({
        User: similarAccounts[i]._id,
      });

      if (accountAccess.comparePin(pin)) {
        errorMessage = 'Use a more secure pin';
        break;
      }
    }
  }
  if (errorMessage) return handleResponse(res, errorMessage, 401);

  if (userAccess.pin) return handleResponse(res, 'Pin is already set', 401);

  userAccess.updatePin(pin);
  try {
    await userAccess.save();

    return handleResponse(res, 'Operation successful');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default doSetPin;
