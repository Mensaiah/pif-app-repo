import platformConstants from '../config/platformConstants';
import { IRequest } from '../types/global';

import { consoleLog } from './helpers';
import { handleReqSearch } from './queryHelpers';

const { paginationConfig } = platformConstants;

type PerPageType = (typeof paginationConfig.allowedPerPageValues)[number];

interface PaginationData {
  currentPage: number;
  perPage: PerPageType;
  paginationQueryOptions: {
    sort: { _id: number };
    skip: number;
    limit: PerPageType;
  };
}

interface PaginationResult {
  paginationData: PaginationData;
  queryOptions: PaginationData['paginationQueryOptions'];
  getMeta: (count: number) => MetaData;
}

interface MetaData {
  totalRows: number;
  totalPages: number;
  currentPage: number;
  perPage: PerPageType;
  nextPage: number | null;
  prevPage: number | null;
}

type MetaFunction = (count: number) => MetaData;

export const handlePaginate = (req: IRequest): PaginationResult => {
  let { page, per_page } = handleReqSearch(req, {
    page: 'positive',
    per_page: 'positive',
  });

  page = page || 1;
  per_page = per_page || paginationConfig.perPage;

  let perPage: PerPageType = (per_page ||
    paginationConfig.perPage) as PerPageType;

  if (!paginationConfig.allowedPerPageValues.includes(perPage))
    perPage = paginationConfig.perPage as PerPageType;

  consoleLog({ page, per_page });

  const paginationData: PaginationData = {
    currentPage: page,
    perPage,
    paginationQueryOptions: {
      sort: { _id: -1 },
      skip: page >= 1 ? (page - 1) * perPage : 0,
      limit: perPage,
    },
  };

  const getMeta: MetaFunction = (count: number) => {
    const totalPages: number = Math.ceil(count / perPage);
    const nextPage = page + 1 <= totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return {
      totalRows: count,
      totalPages,
      currentPage: page,
      perPage,
      nextPage,
      prevPage,
    };
  };

  return {
    paginationData,
    queryOptions: paginationData.paginationQueryOptions,
    getMeta,
  };
};
