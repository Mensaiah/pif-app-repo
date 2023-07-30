import { ObjectId } from 'mongoose';

interface DiscountCodeAttributes {
  Product: ObjectId;
  code: string;
  discountType: 'fixed' | 'percentage';
  value: number;
  useCount: number;
  clickCount: number;
  minimumOrderAmount: number;
  maximumUseCount: number;
  maximumUsePerCustomer: number;
  validityStart: Date;
  validityEnd: Date;
  isActive: boolean;
}

interface DiscountCodeUsageAttributes {
  DiscountCode: ObjectId;
  User: ObjectId;
  Product: ObjectId;
  code: string;
  quantity: number;
  amount: number;
  usedAt: Date;
  Transaction: ObjectId;
  Purchase: ObjectId;
}

export { DiscountCodeUsageAttributes };

export default DiscountCodeAttributes;
