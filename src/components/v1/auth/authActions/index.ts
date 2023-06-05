import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';

export { default as doMobileSignup } from './doMobileSignup';
export { default as doDashboardLogin } from './doDashboardLogin';
export { default as verifyOTPCode } from './verifyOTPCode';
export { default as resendOtpCode } from './resendOtpCode';
export { default as finalizeMobileSignup } from './finalizeMobileSignup';

export { default as doMobileLogin } from './doMobileLogin';
export { default as doSetPin } from './doSetPin';

export { default as doForgotPin } from './doForgotPin';
export { default as doResetPin } from './doResetPin';
export { default as doChangePin } from './doChangePin';

export { default as doForgotPassword } from './doForgotPassword';
export { default as doResetPassword } from './doResetPassword';
export { default as doChangePassword } from './doChangePassword';

export const doLogout = async (req: IRequest, res: Response) => {
  try {
    const { sessionId } = req.decoded;
    req.userAccess.sessions.map((session) => {
      if (session.sessionId === sessionId) session.isLoggedOut = true;

      return session;
    });
    await req.userAccess.save();

    return handleResponse(res, useWord('loggedOut', req.lang));
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};
