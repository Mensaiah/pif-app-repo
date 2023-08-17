import {
  DashboardGraphData,
  TimeFilter,
} from '../components/v1/platform/platform.types';

import { getSaleChart } from './getSaleChartData';
import { getUserGraph } from './getUserGraphData';

export const getDashboardGraphData = async (
  timeFilter: TimeFilter
): Promise<Array<DashboardGraphData>> => {
  try {
    const graph = await Promise.all([getUserGraph(), getSaleChart(timeFilter)]);

    return graph;
  } catch (err) {
    throw new Error(err);
  }
};
