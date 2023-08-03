import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import ProductModel from '../product.model';

const getProductsByCategoryAndPartner = async (
  req: IRequest,
  res: Response
) => {
  const { categoryId, partnerId, marketplace } = req.params;

  try {
    const products = await ProductModel.find(
      {
        categories: { $in: [categoryId] },
        Partner: partnerId,
        marketplace,
        isActive: true,
        isApproved: true,
        deletedAt: { $exists: false },
      },
      {
        name: 1,
        caption: 1,
        description: 1,
        disclaimer: 1,
        textForReceiver: 1,
        tags: 1,
        price: 1,
        marketplace: 1,
        photo: 1,
        photos: 1,
        slicePrice: 1,
        isRated18: 1,
      }
    );

    return handleResponse(res, { data: products });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default getProductsByCategoryAndPartner;
