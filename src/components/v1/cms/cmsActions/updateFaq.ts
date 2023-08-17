import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { addSupportedLang, handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { FaqModel } from '../cms.models';
import { updateFaqSchema } from '../cms.policy';

const updateFaq = async (req: IRequest, res: Response) => {
  const { faqId } = req.params;

  const { _id: userId } = req.user;

  const { answer, isDraft, question }: z.infer<typeof updateFaqSchema> =
    req.body;

  try {
    const faqExists = await FaqModel.findById(faqId);

    if (!faqExists) return handleResponse(res, 'error locating faq', 404);

    if (question) {
      faqExists.question = addSupportedLang(question, faqExists.question);
    }
    if (answer) faqExists.answer = addSupportedLang(answer, faqExists.answer);

    if ('isDraft' in req.body) faqExists.isDraft = isDraft;

    const changesMade = faqExists.isModified();

    if (changesMade) {
      faqExists.LastEditedBy = userId;
      await faqExists.save();
    }

    return handleResponse(res, {
      message: changesMade ? 'Faq updated successfully' : 'No changes made',
      data: faqExists,
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

export default updateFaq;
