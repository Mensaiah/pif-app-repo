import {
  DashboardChartData,
  TimeFilter,
} from '../components/v1/platform/platform.types';

import { getSaleChart } from './getSaleChartData';
import { getUserChart } from './getUserChartData';

export const getDashboardChartData = async (
  timeFilter: TimeFilter
): Promise<DashboardChartData> => {
  try {
    const [userCount, salesCount] = await Promise.all([
      getUserChart(),
      getSaleChart(timeFilter),
    ]);

    return { ...userCount, ...salesCount };
  } catch (err) {
    throw new Error(err);
  }
};
