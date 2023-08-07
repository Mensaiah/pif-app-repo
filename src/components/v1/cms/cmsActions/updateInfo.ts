import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, addSupportedLang } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InfoBoxModel } from '../cms.models';
import { addInfoSchema } from '../cms.policy';

const updateInfo = async (req: IRequest, res: Response) => {
  const { infoId } = req.params;

  try {
    const { _id: userId } = req.user;

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
      info.content = addSupportedLang(content, info.content);
    }

    if ('isPublished' in req.body) info.isPublished = isPublished;
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

export default updateInfo;
