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
import { PartnerPosAttributes } from '../../partnerPos/partnerPos.types';
import { PartnerModel } from '../partner.model';

const getPartners = async (req: IRequest, res: Response) => {
  const { marketplace } = handleReqSearch(req, {
    marketplace: 'string',
  });

  const paginate = handlePaginate(req);

  const marketplaceQuery = getMarketplaceQuery(req, marketplace);
  if (req.sendEmptyData) return handleResponse(res, { data: [] });

  const query: FilterQuery<PartnerPosAttributes & Document> = {
    ...(marketplaceQuery.marketplace &&
      (typeof marketplaceQuery.marketplace === 'object' &&
      '$in' in marketplaceQuery.marketplace
        ? { marketplaces: { $in: marketplaceQuery.marketplace.$in } }
        : { marketplaces: { $in: [marketplaceQuery.marketplace] } })),
  };

  try {
    const partners = await PartnerModel.find(
      query,
      '-rolesAndPermissions',
      paginate.queryOptions
    ).lean();
    const count = await PartnerModel.countDocuments(query);

    return handleResponse(res, {
      data: partners,
      meta: paginate.getMeta(count),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getPartners;
