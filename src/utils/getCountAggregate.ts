import { Model } from 'mongoose';

import { DashboardCardData } from '../components/v1/platform/platform.types';

import { getGrowthBreakdown } from './getGrowthBreakdown';

interface TimeFilter {
  $gte?: Date;
  $lte?: Date;
}

export const getCountAggregate = async (
  name: string,
  Model: Model<any>,
  timeFilter: TimeFilter,
  inverseTimeFiler: TimeFilter,
  query: Record<string, string>
): Promise<DashboardCardData> => {
  try {
    const aggregate = (
      await Model.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: 1,
            },
            value: {
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
                  then: 1,
                  else: 0,
                },
              },
            },
            previousValue: {
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
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
      ])
    )[0];
    return {
      name,
      ...getGrowthBreakdown(
        aggregate.total,
        aggregate.value,
        aggregate.previousValue
      ),
    };
  } catch (err) {
    throw new Error(err);
  }
};
