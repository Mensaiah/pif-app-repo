import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';

export { getPlatformData } from './getPlatformData';
export { addMarketplace } from './addMarketplace';
export { updateMarketplace } from './updateMarketplace';
export { addPlatformSocial } from './addPlatformSocial';
export { updatePlatformSocial } from './updatePlatformSocial';

export const clearDBonDev = async (req: IRequest, res: Response) => {
  return handleResponse(res, 'Not allowed', 403);
  // if (!appConfig.isDev) return handleResponse(res, 'Not allowed', 403);

  // // clear all models in the db, send success to the client and restart server to prompt seeder to run
  // try {
  //   await PlatformModel.deleteMany();
  //   await UserModel.deleteMany();
  //   await UserAccessModel.deleteMany();
  //   await UserInviteModel.deleteMany();
  //   await OtpCodeModel.deleteMany();

  //   handleResponse(res, 'DB cleared successfully');

  //   process.exit(0);
  // } catch (err) {
  //   return handleResponse(res, useWord('internalServerError', req.lang), 500);
  // }
};
