import { FilterQuery } from 'mongoose';

import {
  DashboardCardData,
  TimeFilter,
} from '../components/v1/platform/platform.types';
import PurchaseModel from '../components/v1/purchase/purchase.model';

import { getGrowthBreakdown } from './getGrowthBreakdown';

export const getSumAggregate = async (
  marketplaceQuery: FilterQuery<Document>,
  timeFilter: TimeFilter,
  inverseTimeFiler: TimeFilter
): Promise<Array<DashboardCardData>> => {
  try {
    const aggregate = (
      await PurchaseModel.aggregate([
        {
          $match: marketplaceQuery,
        },
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: '$amount',
            },
            salesCurrent: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $or: [
                          { $eq: [timeFilter.$gte, null] },
                          { $gte: ['$createdAt', timeFilter.$gte] },
                        ],
                      },
                      {
                        $or: [
                          { $eq: [timeFilter.$lte, null] },
                          { $lte: ['$createdAt', timeFilter.$lte] },
                        ],
                      },
                    ],
                  },
                  then: '$amount',
                  else: 0,
                },
              },
            },
            salesPrevious: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $or: [
                          { $eq: [inverseTimeFiler.$gte, null] },
                          { $gte: ['$createdAt', inverseTimeFiler.$gte] },
                        ],
                      },
                      {
                        $or: [
                          { $eq: [inverseTimeFiler.$lte, null] },
                          { $lte: ['$createdAt', inverseTimeFiler.$lte] },
                        ],
                      },
                    ],
                  },
                  then: '$amount',
                  else: 0,
                },
              },
            },
            totalRedeemed: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $ne: [{ $ifNull: ['$redeemedAt', null] }, null] },
                      { $ne: [{ $ifNull: ['$redeemedAt', ''] }, ''] },
                    ],
                  },
                  then: '$amount',
                  else: 0,
                },
              },
            },
            redeemedCurrent: {
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
                      {
                        $or: [
                          { $eq: [timeFilter.$gte, null] },
                          { $gte: ['$createdAt', timeFilter.$gte] },
                        ],
                      },
                      {
                        $or: [
                          { $eq: [timeFilter.$lte, null] },
                          { $lte: ['$createdAt', timeFilter.$lte] },
                        ],
                      },
                    ],
                  },
                  then: '$amount',
                  else: 0,
                },
              },
            },
            redeemedPrevious: {
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
                      {
                        $or: [
                          { $eq: [inverseTimeFiler.$gte, null] },
                          { $gte: ['$createdAt', inverseTimeFiler.$gte] },
                        ],
                      },
                      {
                        $or: [
                          { $eq: [inverseTimeFiler.$lte, null] },
                          { $lte: ['$createdAt', inverseTimeFiler.$lte] },
                        ],
                      },
                    ],
                  },
                  then: '$amount',
                  else: 0,
                },
              },
            },
          },
        },
      ])
    )[0];

    return [
      {
        name: 'PIF Sales',
        ...getGrowthBreakdown(
          aggregate.totalSales,
          aggregate.salesCurrent,
          aggregate.salesPrevious
        ),
      },
      {
        name: 'Total Redeemed',
        ...getGrowthBreakdown(
          aggregate.totalRedeemed,
          aggregate.redeemedCurrent,
          aggregate.redeemedPrevious
        ),
      },
    ];
  } catch (err) {
    throw new Error(err);
  }
};
