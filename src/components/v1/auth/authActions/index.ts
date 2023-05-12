import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';

export { default as doMobileSignup } from './doMobileSignup';
export { default as doDashboardLogin } from './doDashboardLogin';
export { default as verifyMobileSignup } from './verifyMobileSignup';
export { default as resendOtpCode } from './resendOtpCode';
export { default as finalizeMobileSignup } from './finalizeMobileSignup';
export { default as doMobileLogin } from './doMobileLogin';
export { default as doSetPin } from './doSetPin';

export const doLogout = (req: IRequest, res: Response) => {
  res.clearCookie('jwt');
  // TODO: logout the session as well
  handleResponse(res, useWord('loggedOut', req.lang));
};
