import {
  DashboardGraphData,
  TimeFilter,
} from '../components/v1/platform/platform.types';
import PurchaseModel from '../components/v1/purchase/purchase.model';

export const getSaleChart = async (
  timeFilter: TimeFilter
): Promise<DashboardGraphData> => {
  const aggregate = (
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
        $group: {
          _id: null,
          marketplace: {
            $push: '$_id',
          },
          redemptions: {
            $push: '$numberOfRedemptions',
          },
          sales: {
            $push: '$numberOfSales',
          },
        },
      },
    ])
  )[0];

  return {
    title: 'Sales Chart',
    xAxis: aggregate.marketplace,
    yAxis: [
      {
        label: 'No. of redemptions',
        data: aggregate.redemptions,
      },
      {
        label: 'Sales',
        data: aggregate.sales,
      },
    ],
  };
};
