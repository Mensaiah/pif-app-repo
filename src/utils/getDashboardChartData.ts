import {
  DashboardChartData,
  TimeFilter,
} from '../components/v1/platform/platform.types';

import { getSaleChart } from './getSaleChartData';
import { getUserChart } from './getUserChartData';

export const getDashboardChartData = async (
  timeFilter: TimeFilter
): Promise<Array<DashboardChartData>> => {
  try {
    const [userCount, salesCount] = await Promise.all([getUserChart(), getSaleChart(timeFilter)]);

    return { ...userCount , };
  } catch (err) {
    throw new Error(err);
  }
};
