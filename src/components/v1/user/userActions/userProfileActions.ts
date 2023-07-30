import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import {
  _omit,
  _pick,
  consoleLog,
  handleResponse,
} from '../../../../utils/helpers';
import { PartnerPosUserModel, UserModel } from '../user.model';
import { updateProfileSchema } from '../user.policy';

export const getMyProfile = async (req: IRequest, res: Response) => {
  if ('userType' in req.user) {
    return handleResponse(
      res,
      _pick(req.user.toObject(), [
        'name',
        'email',
        'pifId',
        'timezone',
        'userType',
        'avatar',
        'sex',
        'dob',
        'occupation',
        'relationship',
        'hasChildren',
        'interests',
        'contact',
        'socials',
        'termsAccepted',
      ])
    );
  } else {
    return handleResponse(res, {
      data: _omit(req.user.toObject(), ['isActive']),
    });
  }
};

export const updateMyProfile = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof updateProfileSchema>;
  const {
    name,
    phonePrefix,
    phone,
    avatar,
    timezone,
    sex,
    pifId,
    dob,
    occupation,
    relationship,
    hasChildren,
    interests,
    city,
    zip,
    street,
    country,
    social,
  }: dataType = req.body;
  const currentUser = req.user;

  if (pifId) {
    if (!('userType' in currentUser) || currentUser.userType !== 'customer') {
      return handleResponse(
        res,
        'You cannot set PIF ID if you are not a customer',
        403
      );
    }

    if (currentUser.pifId && currentUser.pifId !== pifId) {
      return handleResponse(
        res,
        'You cannot change your PIF ID once it is set',
        403
      );
    }
  }

  if (!('userType' in currentUser)) {
    if (
      social?.length ||
      city ||
      zip ||
      street ||
      country ||
      occupation ||
      relationship ||
      hasChildren ||
      interests?.length
    ) {
      return handleResponse(
        res,
        'A POS user cannot set socials, city, zip, street, country, occupation, relationship, hasChildren or interests',
        403
      );
    }
  }

  try {
    const updatedUser =
      'userType' in currentUser
        ? await UserModel.findOneAndUpdate(
            {
              _id: currentUser._id,
            },
            {
              name,
              timezone,
              avatar,
              sex,
              pifId,
              dob: dob ? new Date(dob) : currentUser.dob,
              occupation,
              relationship,
              hasChildren,
              interests,
              'contact.phonePrefix': phonePrefix,
              'contact.phone': phone,
              'contact.city': city,
              'contact.zip': zip,
              'contact.street': street,
              'contact.country': country,
              socials: social,
            },
            {
              new: true,
            }
          )
        : await PartnerPosUserModel.findOneAndUpdate(
            {
              _id: currentUser._id,
            },
            {
              name,
              timezone,
              avatar,
              sex,
              'contact.phonePrefix': phonePrefix,
              'contact.phone': phone,
            },
            {
              new: true,
            }
          );

    return handleResponse(res, {
      message: 'Profile updated successfully',
      data: _pick(updatedUser.toObject(), [
        'name',
        'email',
        'pifId',
        'timezone',
        'userType',
        'avatar',
        'sex',
        'dob',
        'occupation',
        'relationship',
        'hasChildren',
        'interests',
        'contact',
        'socials',
        'termsAccepted',
      ]),
    });
  } catch (err) {
    handleResponse(res, 'Error handling request at this time', 500, err);
  }
};

export const getUsers = async (req: IRequest, res: Response) => {
  try {
    const users = await UserModel.find({
      userType: 'customer',
    }).select('-Partner -paymentConfigs -favoriteProducts');

    return handleResponse(res, {
      data: users,
    });
  } catch (err) {
    handleResponse(res, 'Error handling request at this time', 500, err);
  }
};

export const getUser = async (req: IRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.userId).populate(
      'Partner'
    );

    return handleResponse(res, {
      data: user,
    });
  } catch (err) {
    handleResponse(res, 'Error handling request at this time', 500, err);
  }
};
