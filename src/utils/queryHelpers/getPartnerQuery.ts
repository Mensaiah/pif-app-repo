import { FilterQuery, Document } from 'mongoose';

import { PartnerModel } from '../../components/v1/partner/partner.model';
import { IRequest } from '../../types/global';

import { hasAccessToMarketplaces } from './helpers';

export const getPartnerQuery = async <T extends Document>(
  req: IRequest,
  partner_id: string
): Promise<FilterQuery<T & Document>> => {
  const query: FilterQuery<T & Document & { Partner?: string }> = {};
  const { userType, user } = req;

  if (userType === 'partner-admin') {
    query.Partner = user.Partner;
    return query;
  }

  if (userType !== 'platform-admin') {
    req.sendEmptyData = true;
    return query;
  }

  if (!partner_id) return query;

  try {
    const partner = partner_id ? await PartnerModel.findById(partner_id) : null;

    if (!partner) {
      req.sendEmptyData = true;
      return query;
    }

    if (!hasAccessToMarketplaces(req, partner.marketplaces)) {
      req.sendEmptyData = true;
    }

    query.Partner = partner_id;

    return query;
  } catch (err) {
    return query;
  }
};

/**
 * Will automatically set Partner query if user is a partner admin
 */
