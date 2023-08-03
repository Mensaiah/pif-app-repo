import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import ProductModel from '../product.model';

const getOtherProducts = async (req: IRequest, res: Response) => {
  const { productId, categoryId, marketplace } = req.params;

  try {
    const otherProducts = await ProductModel.find(
      {
        _id: { $ne: productId },
        categories: { $in: [categoryId] },
        isActive: true,
        isApproved: true,
        marketplace,
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
    )
      .sort({ createdAt: -1 })
      .limit(5);

    return handleResponse(res, { data: otherProducts });
  } catch (error) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      error
    );
  }
};

export default getOtherProducts;
