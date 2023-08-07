import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { InfoBoxModel } from '../cms.models';

const getInfo = async (req: IRequest, res: Response) => {
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

export default getInfo;
