import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { PartnerModel } from '../partner.model';

const getPartnersByCategoryAndMarketplace = async (
  req: IRequest,
  res: Response
) => {
  const { categoryId, marketplace } = req.params;

  try {
    const partners = await PartnerModel.find(
      {
        marketplaces: { $in: [marketplace] },
        productCategories: { $in: [categoryId] },
        status: 'active',
      },
      'name logo logoCropData headquarter'
    );

    return handleResponse(res, {
      data: partners,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default getPartnersByCategoryAndMarketplace;
