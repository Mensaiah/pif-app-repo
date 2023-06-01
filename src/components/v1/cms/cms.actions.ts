import { Response } from 'express';
import { z } from 'zod';

import appConfig from '../../../config';
import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';
import { UserModel } from '../user/user.model';

import { InfoBoxModel, LegalPolicyModel } from './cms.models';
import {
  addInfoSchema,
  addLegalPolicySchema,
  updateLegalPolicySchema,
} from './cms.policy';

export const addInfo = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addInfoSchema>;

  const {
    title,
    content,
    iconifyName,
    iconSvg,
    iconUrl,
    isPublished,
    isNewInfo,
  }: dataType = req.body;

  try {
    const { _id: userId } = req.user;

    const existingUser = await UserModel.findById(userId);

    if (!existingUser)
      return handleResponse(res, 'error adding info', 401, 'invalid-user');

    if (!['admin', 'super-admin'].includes(existingUser.userType))
      return handleResponse(
        res,
        "You're not authorized to perform this operation",
        401,
        'invalid-user'
      );

    const infoExists = await InfoBoxModel.findOne({
      title: title.toLowerCase(),
    });

    if (infoExists && !isNewInfo) {
      return handleResponse(
        res,
        'An info box with this title already exists',
        409,
        'info-exists'
      );
    }

    const newInfo = new InfoBoxModel({
      title,
      isPublished,
      CreatedBy: userId,
      LastEditedBy: userId,
    });

    appConfig.supportedLanguages.forEach((lang) => {
      if (content[lang]) {
        newInfo.content = [
          ...newInfo.content,
          {
            language: lang,
            value: content[lang],
          },
        ];
      }
    });

    if (iconifyName) newInfo.icon.iconifyName = iconifyName;
    if (iconSvg) newInfo.icon.svg = iconSvg;
    if (iconUrl) newInfo.icon.url = iconUrl;

    await newInfo.save();

    return handleResponse(res, {
      message: 'Info box added successfully',
      data: newInfo,
    });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const getInfo = async (req: IRequest, res: Response) => {
  const { infoId } = req.params;

  try {
    const info = await (infoId
      ? InfoBoxModel.findById(infoId)
      : InfoBoxModel.find());

    if (!info) return handleResponse(res, 'error getting info', 404);

    return handleResponse(res, info);
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const updateInfo = async (req: IRequest, res: Response) => {
  const { infoId } = req.params;

  try {
    const { _id: userId } = req.user;

    const existingUser = await UserModel.findById(userId);

    if (!existingUser)
      return handleResponse(res, 'error updating info', 401, 'invalid-user');

    if (!['admin', 'super-admin'].includes(existingUser.userType))
      return handleResponse(
        res,
        "You're not authorized to perform this operation",
        401,
        'invalid-user'
      );

    const info = await InfoBoxModel.findById(infoId);

    if (!info) return handleResponse(res, 'error locating info', 404);

    const {
      title,
      content,
      iconifyName,
      iconSvg,
      iconUrl,
      isPublished,
    }: z.infer<typeof addInfoSchema> = req.body;

    if (title) info.title = title;
    if (content) {
      appConfig.supportedLanguages.forEach((lang) => {
        if (content[lang]) {
          info.content = [
            ...info.content,
            {
              language: lang,
              value: content[lang],
            },
          ];
        }
      });
    }

    if (req.body.hasOwnProperty('isPublished')) info.isPublished = isPublished;
    if (iconifyName) info.icon.iconifyName = iconifyName;
    if (iconSvg) info.icon.svg = iconSvg;
    if (iconUrl) info.icon.url = iconUrl;

    const changesMade = info.isModified();
    if (changesMade) {
      info.LastEditedBy = userId;
      await info.save();
    }

    return handleResponse(res, {
      message: changesMade
        ? 'Info box updated successfully'
        : 'No changes made',
      data: info,
    });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const addLegalPolicy = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addLegalPolicySchema>;

  const { title, content, isPublished, isNewPolicy }: dataType = req.body;

  try {
    const { _id: userId } = req.user;

    const existingUser = await UserModel.findById(userId);

    if (!existingUser)
      return handleResponse(res, 'error adding legal policy', 401);

    if (!['admin', 'super-admin'].includes(existingUser.userType))
      return handleResponse(
        res,
        "You're not authorized to perform this operation",
        401,
        'invalid-user'
      );

    const policyExists = await InfoBoxModel.findOne({
      title: title.toLowerCase(),
    });

    if (policyExists && !isNewPolicy) {
      return handleResponse(
        res,
        'A legal policy with this title already exists',
        409,
        'policy-exists'
      );
    }

    const newPolicy = new InfoBoxModel({
      title,
      isPublished,
      CreatedBy: userId,
      LastEditedBy: userId,
    });

    appConfig.supportedLanguages.forEach((lang) => {
      if (content[lang]) {
        newPolicy.content = [
          ...newPolicy.content,
          {
            language: lang,
            value: content[lang],
          },
        ];
      }
    });

    await newPolicy.save();

    return handleResponse(res, {
      message: 'Legal policy added successfully',
      data: newPolicy,
    });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const getLegalPolicy = async (req: IRequest, res: Response) => {
  const { policyId } = req.params;

  try {
    const policy = await (policyId
      ? LegalPolicyModel.findById(policyId)
      : LegalPolicyModel.find());

    if (!policy) return handleResponse(res, 'error getting policy', 404);

    return handleResponse(res, policy);
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export const updateLegalPolicy = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof updateLegalPolicySchema>;

  const { policyId } = req.params;

  const { _id: userId } = req.user;
  try {
    const policyExists = await LegalPolicyModel.findById(policyId);

    if (!policyExists) return handleResponse(res, 'error locating policy', 404);

    const { title, content, isPublished }: dataType = req.body;

    if (title) policyExists.title = title;
    if (content) {
      appConfig.supportedLanguages.forEach((lang) => {
        if (content[lang]) {
          policyExists.content = [
            ...policyExists.content,
            {
              language: lang,
              value: content[lang],
            },
          ];
        }
      });
    }
    if (req.body.hasOwnProperty('isPublished'))
      policyExists.isPublished = isPublished;

    const changesMade = policyExists.isModified();
    if (changesMade) {
      policyExists.LastEditedBy = userId;
      await policyExists.save();
    }

    return handleResponse(res, {
      message: changesMade ? 'Policy updated successfully' : 'No changes made',
      data: policyExists,
    });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};
