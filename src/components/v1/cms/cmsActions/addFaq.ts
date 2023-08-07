import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { FaqModel } from '../cms.models';
import { addFaqSchema } from '../cms.policy';

const addFaq = async (req: IRequest, res: Response) => {
  type addFaqDataType = z.infer<typeof addFaqSchema>;

  const { question, answer, isDraft }: addFaqDataType = req.body;

  try {
    const { _id: userId } = req.user;

    const faqExists = await FaqModel.findOne({
      question: question.toLowerCase(),
    });

    if (faqExists && !isDraft)
      return handleResponse(
        res,
        'A faq with this question already exists',
        409,
        'faq-exists'
      );

    const newFaq = await new FaqModel({
      question,
      answer,
      isDraft,
      AddedBy: userId,
      LastEditedBy: userId,
    }).save();

    return handleResponse(res, {
      message: 'Faq added successfully',
      data: newFaq,
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

export default addFaq;
