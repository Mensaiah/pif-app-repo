import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { FaqModel } from '../cms.models';

export const getFaq = async (req: IRequest, res: Response) => {
  const { faqId } = req.params;

  try {
    const faq = await (faqId ? FaqModel.findById(faqId) : FaqModel.find());

    if (!faq) return handleResponse(res, 'error getting faq', 404);

    return handleResponse(res, faq);
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default getFaq;
