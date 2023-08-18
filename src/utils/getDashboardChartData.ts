import {
  DashboardChartData,
  TimeFilter,
} from '../components/v1/platform/platform.types';

import { getSaleChart } from './getSaleChartData';
import { getUserChart } from './getUserChartData';

export const getDashboardChartData = async (
  timeFilter: TimeFilter
<<<<<<< HEAD
): Promise<DashboardChartData> => {
  try {
    const [userCount, salesCount] = await Promise.all([
      getUserChart(),
      getSaleChart(timeFilter),
    ]);

    return { ...userCount, ...salesCount };
=======
): Promise<Array<DashboardChartData>> => {
  try {
    const chart = await Promise.all([getUserChart(), getSaleChart(timeFilter)]);

    return chart;
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
  } catch (err) {
    throw new Error(err);
  }
};
