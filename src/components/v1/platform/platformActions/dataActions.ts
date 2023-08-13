import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';

export const getDashboardData = async (req: IRequest, res: Response) => {
  return handleResponse(res, 'men at work');
};

export const getStatisticsData = async (req: IRequest, res: Response) => {
  return handleResponse(res, 'men at work');
};
