import { Document } from 'mongoose';
import { PartnerAttributes } from '../partner/partner.types';
import { ProductAttributes } from '../product/product.types';
import { UserAttributes } from '../user/user.types';
import { PurchaseAttributes } from '../purchase/purchase.types';

export interface RevenueAttributes extends Document {
  revenueFrom: 'pifProportion' | 'fixedFee';
  amount: number;
  currency: number;
  marketplace: string;
  Partner: PartnerAttributes['_id'];
  Product: ProductAttributes['_id'];
  User: UserAttributes['_id'];
  Purchase: PurchaseAttributes['_id'];
}
