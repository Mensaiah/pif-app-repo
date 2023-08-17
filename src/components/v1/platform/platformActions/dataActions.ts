import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import getDashboardCardsData from '../../../../utils/getDashboardCardsData';
import { getDashboardGraphData } from '../../../../utils/getDashboardGraphData';
import { handleTimeFilter } from '../../../../utils/handleTimeFilter';
import { handleTimeFilterInverse } from '../../../../utils/handleTimeFilterInverse';
import { handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import { DashboardData } from '../platform.types';

export const getDashboardData = async (req: IRequest, res: Response) => {
  const timeFilter = handleTimeFilter(req);
  const timeFilterInverse = handleTimeFilterInverse(req);
  const { marketplace } = handleReqSearch(req, {
    marketplace: 'string',
  });

  try {
    const dashboardData: DashboardData = {
      cards: await getDashboardCardsData(
        req,
        timeFilter,
        timeFilterInverse,
        marketplace
      ),
      graphs: await getDashboardGraphData(timeFilter),
      tables: [],
    };

    return handleResponse(res, dashboardData, 200);
  } catch (error) {
    return handleResponse(
      res,
      'Sorry this record cannot be gotten at this moment try again later',
      400
    );
  }
};

export const getStatisticsData = async (req: IRequest, res: Response) => {
  return handleResponse(res, 'men at work');
};
