import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleTimeFilter } from '../../../../utils/handleTimeFilter';
import { handleTimeFilterInverse } from '../../../../utils/handleTimeFilterInverse';
import { handleResponse } from '../../../../utils/helpers';
import { PartnerModel } from '../../partner/partner.model';
import { UserModel } from '../../user/user.model';
import { DashboardCardData, DashboardData } from '../platform.types';

import { getCountAggregate } from './getCountAggregate';
export const getDashboardData = async (req: IRequest, res: Response) => {
  const timeFilter = handleTimeFilter(req);
  const timeFilterInverse = handleTimeFilterInverse(req);

  const dashboardData: DashboardData = {
    cards: [],
  };

  const cards: Array<DashboardCardData> = await Promise.all([
    getCountAggregate('Users', UserModel, timeFilter, timeFilterInverse),
    getCountAggregate('Suppliers', PartnerModel, timeFilter, timeFilterInverse),
  ]);
  dashboardData.cards = cards;

  return handleResponse(res, dashboardData);
};

export const getStatisticsData = async (req: IRequest, res: Response) => {
  return handleResponse(res, 'men at work');
};
