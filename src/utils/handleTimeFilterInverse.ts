import { IRequest } from '../types/global';

import { handleReqSearch } from './queryHelpers';

interface TimeFilter {
  $gte?: Date;
  $lte?: Date;
}

export const handleTimeFilterInverse = (req: IRequest): TimeFilter => {
  const { duration } = handleReqSearch(req, {
    duration: 'string',
  });

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  const invertedDurationToDuration: Record<string, string> = {
    today: 'yesterday',
    this_week: 'last_week',
    this_month: 'last_month',
    this_year: 'last_year',
  };

  const invertedDuration = invertedDurationToDuration[duration];

  switch (invertedDuration) {
    case 'yesterday':
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
      endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_week':
      const startOfThisWeek = new Date(currentDate);
      startOfThisWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      startDate = new Date(startOfThisWeek);
      startDate.setDate(startOfThisWeek.getDate() - 7);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_month':
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last_year':
      startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      endDate = new Date(
        currentDate.getFullYear() - 1,
        11,
        31,
        23,
        59,
        59,
        999
      );
      break;
    case 'all_time':
    default:
      startDate = null;
      endDate = null;
      break;
  }

  // Construct the MongoDB time filter
  if (!startDate && !endDate) return {};

  const timeFilter: TimeFilter = {};
  if (startDate) {
    timeFilter.$gte = startDate;
  }
  if (endDate) {
    timeFilter.$lte = endDate;
  }

  return timeFilter;
};
