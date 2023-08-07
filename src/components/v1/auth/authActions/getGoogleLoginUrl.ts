import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { urlGoogle } from '../authUtils/googleHelpers';

export const getGoogleLoginUrl = async (_req: IRequest, res: Response) => {
  try {
    const authUrl = await urlGoogle();

    return handleResponse(res, {
      success: true,
      payload: {
        authUrl,
      },
    });
  } catch (err) {
    return handleResponse(
      res,
      err?.message || 'Google login url could not be generated',
      500
    );
  }
};
