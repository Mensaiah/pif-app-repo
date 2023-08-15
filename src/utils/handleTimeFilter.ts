import { IRequest } from '../types/global';

import { handleReqSearch } from './queryHelpers';

interface TimeFilter {
  $gte?: Date;
  $lte?: Date;
}

export const handleTimeFilter = (req: IRequest): TimeFilter => {
  const { from, to, duration } = handleReqSearch(req, {
    from: 'string',
    to: 'string',
    duration: 'string',
  });

  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (from && to) {
    startDate = new Date(from);
    endDate = new Date(to);
  } else {
    switch (duration) {
      case 'today':
        startDate = startOfDay;
        endDate = currentDate;
        break;
      case 'this_week':
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = currentDate;
        break;
      case 'this_month':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = currentDate;
        break;
      case 'this_year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = currentDate;
        break;
      case 'all_time':
      default:
        startDate = null;
        endDate = null;
        break;
    }
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
