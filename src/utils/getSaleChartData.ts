import {
  DashboardChartData,
  TimeFilter,
} from '../components/v1/platform/platform.types';
import PurchaseModel from '../components/v1/purchase/purchase.model';

export const getSaleChart = async (
  timeFilter: TimeFilter
): Promise<DashboardChartData> => {
  const aggregate: Array<Record<string, string>> =
    await PurchaseModel.aggregate([
      {
        $group: {
          _id: '$marketplace',
          numberOfSales: {
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
        },
      },
      {
        $project: {
          _id: 0,
          marketplace: '$_id',
          numberOfRedemptions: 1,
          numberOfSales: 1,
        },
      },
    ]);

  return {
    salesChart: aggregate,
  };
};
