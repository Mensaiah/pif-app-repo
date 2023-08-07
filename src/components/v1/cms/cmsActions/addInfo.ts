import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, addSupportedLang } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InfoBoxModel } from '../cms.models';
import { addInfoSchema } from '../cms.policy';

const addInfo = async (req: IRequest, res: Response) => {
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

    newInfo.content = addSupportedLang(content, newInfo.content);

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

export default addInfo;
