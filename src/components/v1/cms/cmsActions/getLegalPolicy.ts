import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { LegalPolicyModel } from '../cms.models';

const getLegalPolicy = async (req: IRequest, res: Response) => {
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

export default getLegalPolicy;
