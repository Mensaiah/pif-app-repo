import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import ProductModel from '../product.model';

const getSingleProduct = async (req: IRequest, res: Response) => {
  const { productId } = req.params;

  const { userType } = req;
  const isGuestOrCustomer = !userType || userType === 'customer';

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = isGuestOrCustomer
      ? { _id: productId, deletedAt: { $exists: false } }
      : { _id: productId };
    const selectedFields = isGuestOrCustomer
      ? 'name caption description disclaimer textForReceiver tags price marketplace photo photos slicePrice isRated18'
      : '';
    if (isGuestOrCustomer) query.isActive = true;
    if (userType !== 'platform-admin') query.isApproved = true;

    const product = await (isGuestOrCustomer
      ? ProductModel.findOne(query, selectedFields)
      : ProductModel.findOne(query)
          .populate('categories', 'name')
          .populate('Partner', 'name')
          .populate('internalCategory', 'name'));

    if (!product) return handleResponse(res, 'Product does not exist', 404);

    return handleResponse(res, { data: product });
  } catch (err) {
    return handleResponse(
      res,
      useWord('internalServerError', req.lang),
      500,
      err
    );
  }
};

export default getSingleProduct;