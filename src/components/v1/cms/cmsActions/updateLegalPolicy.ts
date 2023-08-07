import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, addSupportedLang } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { LegalPolicyModel } from '../cms.models';
import { updateLegalPolicySchema } from '../cms.policy';

const updateLegalPolicy = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof updateLegalPolicySchema>;

  const { policyId } = req.params;

  const { _id: userId } = req.user;
  try {
    const policyExists = await LegalPolicyModel.findById(policyId);

    if (!policyExists) return handleResponse(res, 'error locating policy', 404);

    const { title, content, isPublished }: dataType = req.body;

    if (title) policyExists.title = title;
    if (content) {
      policyExists.content = addSupportedLang(content, policyExists.content);
    }
    if ('isPublished' in req.body) policyExists.isPublished = isPublished;

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

export default updateLegalPolicy;
