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
<<<<<<< HEAD
  inverseTimeFiler: TimeFilter,
  query: Record<string, string>
=======
  inverseTimeFiler: TimeFilter
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
): Promise<DashboardCardData> => {
  try {
    const aggregate = (
      await Model.aggregate([
        {
<<<<<<< HEAD
          $match: query,
        },
        {
=======
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
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
<<<<<<< HEAD
            previousValue: {
=======
            previous: {
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
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
