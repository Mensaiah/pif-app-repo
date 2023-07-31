import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { UserAccessModel } from '../auth.models';
import { changePinSchema } from '../auth.policy';

const doChangePin = async (req: IRequest, res: Response) => {
  type changePinDatatype = z.infer<typeof changePinSchema>;

  const { user, userAccess } = req;
  const { oldPin, newPin }: changePinDatatype = req.body;

  try {
    if (!userAccess.comparePin(oldPin))
      return handleResponse(res, 'Old Pin is incorrect.', 401);

    const similarAccounts = await UserModel.find({
      _id: { $ne: user._id },
      'contact.phone': user.contact.phone,
      'contact.phonePrefix': user.contact.phonePrefix,
    });

    if (similarAccounts.length) {
      for (let i = 0; i < similarAccounts.length; i++) {
        const accountAccess = await UserAccessModel.findOne({
          User: similarAccounts[i]._id,
        });

        if (accountAccess.comparePin(newPin))
          return handleResponse(res, 'Use a more secure pin', 401);
      }
    }

    // userAccess.pin = newPin;
    userAccess.updatePin(newPin);

    await userAccess.save();

    return handleResponse(res, 'Pin changed successfully');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 501, err);
  }
};

export default doChangePin;
