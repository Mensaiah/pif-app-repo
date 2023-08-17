import { DashboardGraphData } from '../components/v1/platform/platform.types';
import { UserModel } from '../components/v1/user/user.model';

export const getUserGraph = async (): Promise<DashboardGraphData> => {
  const currentYear = new Date().getFullYear();
  const aggregate = (
    await UserModel.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $year: '$createdAt' }, currentYear],
          },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                {
                  case: { $eq: [{ $month: '$createdAt' }, 1] },
                  then: 'January',
                },
                {
                  case: { $eq: [{ $month: '$createdAt' }, 2] },
                  then: 'February',
                },
                { case: { $eq: [{ $month: '$createdAt' }, 3] }, then: 'March' },
                { case: { $eq: [{ $month: '$createdAt' }, 4] }, then: 'April' },
                { case: { $eq: [{ $month: '$createdAt' }, 5] }, then: 'May' },
                { case: { $eq: [{ $month: '$createdAt' }, 6] }, then: 'June' },
                { case: { $eq: [{ $month: '$createdAt' }, 7] }, then: 'July' },
                {
                  case: { $eq: [{ $month: '$createdAt' }, 8] },
                  then: 'August',
                },
                {
                  case: { $eq: [{ $month: '$createdAt' }, 9] },
                  then: 'September',
                },
                {
                  case: { $eq: [{ $month: '$createdAt' }, 10] },
                  then: 'October',
                },
                {
                  case: { $eq: [{ $month: '$createdAt' }, 11] },
                  then: 'November',
                },
                {
                  case: { $eq: [{ $month: '$createdAt' }, 12] },
                  then: 'December',
                },
              ],
              default: 'Unknown',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          months: { $push: '$_id' },
          data: { $push: '$count' },
        },
      },
    ])
  )[0];

  return {
    title: 'Active User',
    xAxis: aggregate.months,
    yAxis: [
      {
        label: 'New Registrations',
        data: aggregate.data,
      },
    ],
  };
};
