import { Response } from 'express';
import { Document, FilterQuery } from 'mongoose';
import { z } from 'zod';

import platformConstants from '../../../../config/platformConstants';
import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { _omit, _pick, handleResponse } from '../../../../utils/helpers';
import {
  getMarketplaceQuery,
  handleReqSearch,
} from '../../../../utils/queryHelpers';
import { PartnerPosUserModel, UserModel } from '../user.model';
import { updateProfileSchema } from '../user.policy';
import { UserAttributes } from '../user.types';

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
    email,
  }: dataType = req.body;

  const { user: currentUser, userType } = req;

  if (email) {
    if (currentUser.email !== email) {
      return handleResponse(
        res,
        'You cannot change your email address with this method',
        403
      );
    }
    const existingCustomerWithEmail = await UserModel.findOne({
      userType: 'customer',
      email,
    });

    if (
      existingCustomerWithEmail &&
      existingCustomerWithEmail._id !== currentUser._id
    ) {
      return handleResponse(res, 'Another user already use this email', 409);
    }
  }

  if (pifId) {
    if (req.userType !== 'customer') {
      return handleResponse(
        res,
        'You cannot set PIF ID if you are not a customer',
        403
      );
    }

    if ('pifId' in currentUser && currentUser.pifId.length) {
      return handleResponse(
        res,
        'You cannot change your PIF ID once it is set',
        403
      );
    }
  }

  if (userType !== 'customer') {
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
              email,
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
  const { userType, searchQuery, currentMarketplace } = handleReqSearch(req, {
    userType: 'string',
    searchQuery: 'string',
    currentMarketplace: 'string',
  });

  const paginate = handlePaginate(req);

  const martketplaceQuery = getMarketplaceQuery(req, currentMarketplace);
  if (req.sendEmptyData) {
    return handleResponse(res, {
      data: [],
    });
  }

  if (userType) {
    if (!platformConstants.platformUserTypes.includes(userType as any)) {
      return handleResponse(res, {
        data: [],
      });
    }

    if (req.userType !== 'platform-admin') {
      if (userType === 'platform-admin')
        return handleResponse(res, {
          data: [],
        });
    }
  }

  const query: FilterQuery<UserAttributes & Document> = {
    ...martketplaceQuery,
    ...(userType && {
      userType,
    }),
  };
  const textQuery: FilterQuery<UserAttributes & Document> = {
    ...query,
    ...(searchQuery && {
      $text: { $search: searchQuery },
    }),
  };
  const regexQuery: FilterQuery<UserAttributes & Document> = {
    ...query,
    ...(searchQuery && {
      $or: [
        { pifId: { $regex: new RegExp('^' + searchQuery, 'i') } },
        { name: { $regex: new RegExp('^' + searchQuery, 'i') } },
        { email: { $regex: new RegExp('^' + searchQuery, 'i') } },
      ],
    }),
  };

  let usedRegexSearch = false;
  const selectFields = '-Partner -paymentConfigs -favoriteProducts';

  try {
    let users = await UserModel.find(textQuery).select(selectFields).lean();
    // TODO: use only regex search after few considerations
    // If no users are found using full-text search, try regex search
    if (users.length === 0 && searchQuery) {
      users = await UserModel.find(regexQuery).select(selectFields).lean();

      usedRegexSearch = true;
    }

    const count = await UserModel.countDocuments(
      usedRegexSearch ? regexQuery : textQuery
    );

    return handleResponse(res, {
      data: users,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(res, 'Error handling request at this time', 500, err);
  }
};

export const getUser = async (req: IRequest, res: Response) => {
  // TODO: ensure the user asking to see this user data is allowed to see it
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
