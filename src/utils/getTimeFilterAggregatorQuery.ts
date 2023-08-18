import { TimeFilter } from '../components/v1/platform/platform.types';

const getTimeFilterAggregatorQuery = (timeFilter: TimeFilter) => {
  return [
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
  ];
};

export default getTimeFilterAggregatorQuery;
