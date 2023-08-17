import { PartnerModel } from '../components/v1/partner/partner.model';
import {
  DashboardCardData,
  TimeFilter,
} from '../components/v1/platform/platform.types';
import { UserModel } from '../components/v1/user/user.model';
import { IRequest } from '../types/global';

import { getCountAggregate } from './getCountAggregate';
import { getSumAggregate } from './getSumAggregate';
import { getMarketplaceQuery } from './queryHelpers';

const getDashboardCardsData = async (
  req: IRequest,
  timeFilter: TimeFilter,
  timeFilterInverse: TimeFilter,
  marketplace: string
): Promise<Array<DashboardCardData>> => {
  try {
    let cards: Array<DashboardCardData> = await Promise.all([
      getCountAggregate('Users', UserModel, timeFilter, timeFilterInverse),
      getCountAggregate(
        'Suppliers',
        PartnerModel,
        timeFilter,
        timeFilterInverse
      ),
      {
        name: 'Unresolved tickets',
        percentageChange: 0,
        difference: 0,
        value: 0,
      },
      {
        name: 'Resolved tickets',
        percentageChange: 0,
        difference: 0,
        value: 0,
      },
    ]);

    if (marketplace) {
      const marketplaceQuery = getMarketplaceQuery(req, marketplace);
      const salesBreakdown = await getSumAggregate(
        marketplaceQuery,
        timeFilter,
        timeFilterInverse
      );
      cards = [...salesBreakdown, ...cards];
    }

    return cards;
  } catch (error) {}
};

export default getDashboardCardsData;
