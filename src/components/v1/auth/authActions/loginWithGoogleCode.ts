import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { consoleLog, handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import { getGoogleAccountFromCode } from '../authUtils/googleHelpers';

export const loginWithGoogleCode = async (req: IRequest, res: Response) => {
  const { code } = handleReqSearch(req, { code: 'string' });
  if (!code) return handleResponse(res, 'Google Auth Code is required!', 401);

  try {
    const gogoleUserData = await getGoogleAccountFromCode(code);
    const { id, email, tokens } = gogoleUserData;
    consoleLog(JSON.stringify({ gogoleUserData }, null, 2));

    // return res.redirect(`v1/en/auth/google-user/?auth=${tokens}`);
    return handleResponse(res, {
      success: true,
      data: {
        id,
        email,
        tokens,
      },
    });
  } catch (err) {
    consoleLog({ err });
    return handleResponse(res, 'Error verifying your login', 401);
  }
};
