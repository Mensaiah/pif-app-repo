import { DashboardChartData } from '../components/v1/platform/platform.types';
import { UserModel } from '../components/v1/user/user.model';

export const getUserChart = async (): Promise<DashboardChartData> => {
  const currentYear = new Date().getFullYear();
  const aggregate: Array<Record<string, string | number>> = await UserModel.aggregate([
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
          monthNumber: { $month: '$createdAt' },
          month: {
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
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        monthNumber: '$_id.monthNumber',
        count: '$count',
      },
    },
    {
      $sort: {
        monthNumber: 1,
      },
    },
  ]);
  const result = aggregate;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const counts = Array(12).fill(0);
  result.forEach(({ monthNumber, count }) => {
    counts[Number(monthNumber) - 1] = count;
  });

  const output = months.map((month, i) => ({
    month,
    count: counts[i],
  }));

  return {
    userCount: output,
  };
};
