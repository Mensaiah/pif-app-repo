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
        name: 1,
        quantity: 1,
        quantityAlert: 1,
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $ne: ['$quantityAlert', 0] },
            { $ne: ['$quantity', -1] },
            { $lte: ['$quantity', '$quantityAlert'] },
          ],
        },
      },
    },
    {
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
