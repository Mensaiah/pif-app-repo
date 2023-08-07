import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, addSupportedLang } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { LegalPolicyModel } from '../cms.models';
import { addLegalPolicySchema } from '../cms.policy';

const addLegalPolicy = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addLegalPolicySchema>;

  const { title, content, isPublished, isNewPolicy }: dataType = req.body;

  try {
    const { _id: userId } = req.user;

    const policyExists = await LegalPolicyModel.findOne({
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

    const newPolicy = new LegalPolicyModel({
      title,
      isPublished,
      CreatedBy: userId,
      LastEditedBy: userId,
    });

    newPolicy.content = addSupportedLang(content, newPolicy.content);

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

export default addLegalPolicy;
