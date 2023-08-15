import { Model } from 'mongoose';

import { DashboardCardData } from '../platform.types';

interface TimeFilter {
  $gte?: Date;
  $lte?: Date;
}

export const getCountAggregate = async (
  name: string,
  Model: Model<any>,
  timeFilter: TimeFilter,
  inverseTimeFiler: TimeFilter
): Promise<DashboardCardData> => {
  const aggregate = await Model.aggregate([
    {
      $group: {
        _id: null,
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
        previous: {
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
  ]);

  const currentValue = aggregate[0].value;
  const previousValue = aggregate[0].previous;
  const difference = currentValue - previousValue;
  const percentageChange = ((difference / (previousValue || 1)) * 100).toFixed(
    2
  );

  return {
    name,
    percentageChange: Number(percentageChange),
    value: currentValue,
  };
};
