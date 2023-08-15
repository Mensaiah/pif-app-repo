import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handlePaginate } from '../../../../utils/handlePaginate';
import { handleResponse } from '../../../../utils/helpers';
import {
  handleReqSearch,
  getMarketplaceQuery,
} from '../../../../utils/queryHelpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../partner.model';
import { PartnerAttributes } from '../partner.types';

const getPartners = async (req: IRequest, res: Response) => {
  const { marketplace, status, search_query } = handleReqSearch(req, {
    marketplace: 'string',
    status: 'string',
    search_query: 'string',
  });

  const paginate = handlePaginate(req);

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);
  if (req.sendEmptyData) return handleResponse(res, { data: [] });

  const query: FilterQuery<PartnerAttributes & Document> = {
    ...(marketplaceQuery.marketplace &&
      (typeof marketplaceQuery.marketplace === 'object' &&
      '$in' in marketplaceQuery.marketplace
        ? { marketplaces: { $in: marketplaceQuery.marketplace.$in } }
        : { marketplaces: { $in: [marketplaceQuery.marketplace] } })),

    ...(status &&
      ['active', 'inactive', 'not-verified'].includes(status) && {
        status,
      }),
  };

  const textQuery: FilterQuery<PartnerAttributes & Document> = {
    ...query,
    ...(search_query && {
      $text: { $search: search_query },
    }),
  };

  const regex = new RegExp('^.*' + search_query, 'i');

  const regexQuery: FilterQuery<PartnerAttributes & Document> = {
    ...query,
    ...(search_query && {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
      ],
    }),
  };

  try {
    let useRegexSearch = false;

    let allPartners = await PartnerModel.find(
      textQuery,
      '-rolesAndPermissions',
      paginate.queryOptions
    )
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!allPartners.length) {
      useRegexSearch = true;

      allPartners = await PartnerModel.find(
        regexQuery,
        '-rolesAndPermissions',
        paginate.queryOptions
      )
        .sort({
          createdAt: -1,
        })
        .lean();
    }

    const count = await PartnerModel.countDocuments(
      useRegexSearch ? regexQuery : textQuery
    );

    return handleResponse(res, {
      data: allPartners,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getPartners;
