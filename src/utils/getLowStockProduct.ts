import { LowStockAlertData } from '../components/v1/platform/platform.types';
import ProductModel from '../components/v1/product/product.model';
import { IRequest } from '../types/global';

const getLowStockProduct = async (
  req: IRequest
): Promise<Array<LowStockAlertData>> => {
  const aggregate: Array<LowStockAlertData> = await ProductModel.aggregate([
    {
      $project: {
        _id: 0,
<<<<<<< HEAD
        name: 1,
=======
        name: {
          $filter: {
            input: '$name',
            as: 'nameItem',
            cond: {
              $eq: ['$$nameItem.lang', req.lang],
            },
          },
        },
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
        quantity: 1,
        quantityAlert: 1,
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $ne: ['$quantityAlert', 0] },
<<<<<<< HEAD
            { $ne: ['$quantity', -1] },
=======
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
            { $lte: ['$quantity', '$quantityAlert'] },
          ],
        },
      },
    },
    {
<<<<<<< HEAD
=======
      $project: {
        name: {
          $arrayElemAt: ['$name.value', 0],
        },
        quantity: 1,
        quantityAlert: 1,
      },
    },
    {
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
      $sort: {
        quantity: 1,
      },
    },
    {
      $limit: 10,
    },
  ]);

  return aggregate;
};

export default getLowStockProduct;
