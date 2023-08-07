import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { CategoryModel } from '../category.model';

const getCategoryByMarketplace = async (req: IRequest, res: Response) => {
  const { marketplace } = req.params;

  if (marketplace.length !== 2)
    return handleResponse(res, 'invalid marketplace', 400);

  try {
    const categories = await CategoryModel.find(
      {
        isEnabled: true,
        isFunctional: true,
        marketplaces: { $in: [marketplace] },
      },
      'name Icon'
    ).lean();

    return handleResponse(res, {
      data: categories,
    });
  } catch (err) {
    handleResponse(res, 'error fetching categories', 500, err);
  }
};

export default getCategoryByMarketplace;
