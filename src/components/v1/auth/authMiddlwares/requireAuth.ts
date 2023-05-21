import { Response, NextFunction } from 'express';

import { FingerprintResult } from '../../../../appMiddlewares/fingerprint.middleware';
import { IRequest } from '../../../../types/global';
import { handleResponse, consoleLog } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerPosUserModel, UserModel } from '../../user/user.model';
import { UserAccessModel } from '../auth.models';

const requireAuth = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.decoded)
    return handleResponse(res, useWord('authIsRequired', req.lang), 401);

  const { sessionId, ref, authKey, userType } = req.decoded;
  const currentUserIsUser = ['admin', 'customer', 'partner-admin'].includes(
    userType
  );

  try {
    const user = currentUserIsUser
      ? await UserModel.findById(ref)
      : await PartnerPosUserModel.findById(ref);

    if (!user) return handleResponse(res, 'auhtorization failed', 401);

    const userAccess = await UserAccessModel.findOne(
      currentUserIsUser ? { User: user._id } : { PartnerPosUser: user._id }
    );
    if (!userAccess) return handleResponse(res, 'authorization failed', 401);
    if (userAccess.isBlocked)
      return handleResponse(res, 'You have been banned. Contact us', 401);

    // TODO: if user is not customer and has no password, he should get this => if (set password first)

    // if user is a customer and have not set pin
    if (
      userType === 'customer' &&
      !userAccess.pin &&
      req.originalUrl !== '/v1/en/auth/m-pin'
    )
      return handleResponse(res, 'You need to set your pin first!', 403);

    // // if user is not a customer and have not set password
    // if (userType !== 'customer' && !userAccess.password)
    //   return handleResponse(res, 'Set your password.', 403);

    // find session index
    const sessionIndex = userAccess.sessions.findIndex(
      (sesn) => sesn.sessionId === sessionId
    );
    const session = userAccess.sessions[sessionIndex];

    if (!session)
      return handleResponse(res, useWord('invalidSession', req.lang), 401);

    if (session.isLoggedOut)
      return handleResponse(res, useWord('loggedOut', req.lang), 401);

    // ensure the session is originated from requesting device
    const fingerprint: FingerprintResult = req.fingerprint;
    const { hash: deviceHash } = fingerprint;
    if (session.deviceHash !== deviceHash) {
      consoleLog({
        deviceHash: session.deviceHash,
        requestDeviceHash: deviceHash,
      });
      return handleResponse(
        res,
        'Session expired, please login again',
        401,
        'Session deviceHash does not match with request deviceHash'
      );
    }

    const now = new Date();
    // enforce maximum inactivity
    if (
      now.getTime() - new Date(session.lastEventTime).getTime() >
      session.maxInactivity
    )
      return handleResponse(res, 'Session expired, please login again', 401);

    // enforce maximum session lifespan
    if (
      now.getTime() - new Date(session.lastEventTime).getTime() >
      session.maxLivespan
    )
      return handleResponse(res, 'Session expired, please login again', 401);

    // ensure security key is intact
    if (authKey !== userAccess.securityCode)
      return handleResponse(
        res,
        'Authentication expired, please login again',
        401
      );

    userAccess.lastEventTime = now;
    userAccess.sessions[sessionIndex].lastEventTime = now;

    req.userType = req.decoded.userType;
    req.userAccess = userAccess;
    req.user = user;

    consoleLog({ url: req.originalUrl, path: req.path });

    return next();
  } catch (err) {
    return handleResponse(res, 'Authentication error', 401, err);
  }
};
export default requireAuth;
