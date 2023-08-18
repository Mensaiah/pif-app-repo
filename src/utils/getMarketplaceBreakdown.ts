import {
  DashboardChartData,
  MarketPlaceBreakdown,
  TimeFilter,
} from '../components/v1/platform/platform.types';
import PurchaseModel from '../components/v1/purchase/purchase.model';

import { getGrowthBreakdown } from './getGrowthBreakdown';
import getTimeFilterAggregatorQuery from './getTimeFilterAggregatorQuery';

const getMarketplaceBreakdown = async (
  timeFilter: TimeFilter,
  timeFilterInverse: TimeFilter
): Promise<Array<MarketPlaceBreakdown>> => {
  const timeFilterQuery = getTimeFilterAggregatorQuery(timeFilter);

  const inverseTimeFilterQuery =
    getTimeFilterAggregatorQuery(timeFilterInverse);
  const aggregate: Array<MarketPlaceBreakdown> = await PurchaseModel.aggregate([
    {
      $group: {
        _id: '$marketplace',
        totalSent: {
          $sum: {
            $cond: {
              if: {
                $and: timeFilterQuery,
              },
              then: 1,
              else: 0,
            },
          },
        },
        totalSentPrevious: {
          $sum: {
            $cond: {
              if: {
                $and: inverseTimeFilterQuery,
              },
              then: 1,
              else: 0,
            },
          },
        },
        numberOfRedemptions: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  {
                    $or: [
                      { $ne: [{ $ifNull: ['$redeemedAt', null] }, null] },
                      { $ne: [{ $ifNull: ['$redeemedAt', ''] }, ''] },
                    ],
                  },
                  ...timeFilterQuery,
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        numberOfRedemptionsPrevious: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  {
                    $or: [
                      { $ne: [{ $ifNull: ['$redeemedAt', null] }, null] },
                      { $ne: [{ $ifNull: ['$redeemedAt', ''] }, ''] },
                    ],
                  },
                  ...inverseTimeFilterQuery,
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        totalIncome: {
          $sum: {
            $cond: {
              if: {
                $and: timeFilterQuery,
              },
              then: '$amount',
              else: 0,
            },
          },
        },
        totalIncomePrevious: {
          $sum: {
            $cond: {
              if: {
                $and: inverseTimeFilterQuery,
              },
              then: '$amount',
              else: 0,
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        country: '$_id',
        totalSent: 1,
        totalSentPrevious: 1,
        numberOfRedemptions: 1,
        numberOfRedemptionsPrevious: 1,
        totalIncome: 1,
        totalIncomePrevious: 1,
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { marketplace: '$country' },
        as: 'userCount',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$userType', 'customer'] },
                  { $eq: ['$currentMarketplace', '$$marketplace'] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        userCount: {
          $arrayElemAt: ['$userCount', 0],
        },
      },
    },
    {
      $addFields: {
        userCount: '$userCount.count',
      },
    },
    {
      $addFields: {
        userCount: {
          $cond: {
            if: { $eq: [{ $ifNull: ['$userCount', null] }, null] },
            then: 0,
            else: '$userCount',
          },
        },
      },
    },
  ]);

  const result = aggregate.map((data) => {
    const sentBreakdown = getGrowthBreakdown(
      0,
      Number(data.totalSent),
      Number(data.totalSentPrevious)
    );

    const redemptionsBreakdown = getGrowthBreakdown(
      0,
      Number(data.numberOfRedemptions),
      Number(data.numberOfRedemptionsPrevious)
    );

    const incomeBreakdown = getGrowthBreakdown(
      0,
      Number(data.totalIncome),
      Number(data.totalIncomePrevious)
    );

    return {
      ...data,
      differenceInSent: sentBreakdown.difference,
      percentageChangeInSent: sentBreakdown.percentageChange,
      differenceInRedemption: redemptionsBreakdown.difference,
      percentageChangeInRedemption: redemptionsBreakdown.percentageChange,
      differenceInIncome: incomeBreakdown.difference,
      percentageChangeInIncome: incomeBreakdown.percentageChange,
    };
  });

  return result;
};

export default getMarketplaceBreakdown;
