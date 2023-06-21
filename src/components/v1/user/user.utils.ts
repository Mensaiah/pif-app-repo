import { IRequest } from '../../../types/global';

export const createInviteLink = (req: IRequest, code: string) =>
  `${req.protocol}://${
    req.protocol === 'http' ? 'localhost:5173' : 'pif-dashboard.web.app'
  }${req.baseUrl.replace(
    /users|partners/g,
    'auth'
  )}/invitation/${code}`.replace('/v1/en', '');
