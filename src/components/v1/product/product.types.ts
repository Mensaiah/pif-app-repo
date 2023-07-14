import { Document, ObjectId } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';

export interface ProductAttributes extends Document {
  name: LanguageValuePair[];
  caption: LanguageValuePair[];
  description: LanguageValuePair[];
  disclaimer: LanguageValuePair[];
  textForReceiver: LanguageValuePair[];
  tags: string[];
  Partner: ObjectId;
  price: number;
  marketplace: string;
  photo: string;
  photos: string[];
  productType: 'regular-product' | 'free-gift';
  categories: ObjectId[];
  internalCategory: ObjectId;
  redemptionValidityType: 'date' | 'period';
  redemptionValidityPeriodType: 'days' | 'weeks' | 'months';
  redemptionValidityValue: string;
  extraProduct: {
    description: LanguageValuePair[];
    photo: string;
  } | null;
  validThru: Date;
  quantity: number;
  qtySold: number;
  deletedAt?: Date;
  version: number;
  isCurrentVersion: boolean;
  originId: number;
  order: boolean;
  quantityAlert: number;
  tax: number;
  cities: ObjectId[];
  isCountedTowardsReward: boolean;
  canBeRedeemedAsRewards: boolean;
  isBonusProductOnly: boolean;
  slicePrice: number;
  isRated18: boolean;
  status: 'active' | 'inactive';
  productCode: {
    code: string;
    eanCodeSource: number;
    purchaseId: string;
    validatedAt: Date;
  }; //*
  isApproved: boolean;
  isActive: boolean;
  approvedBy: ObjectId;
  canBeSent: 'immediately' | 'next-period';
  canBeSentPeriodType: 'hour' | 'day' | 'week' | 'month';
  canBeSentPeriodValue: number;
  splitPrices: {
    code: string;
    discountType: 'fixed' | 'percentage';
    value: number;
    useCount?: number;
    clickCount?: number;
    minimumOrderAmount: number;
    maximumUseCount: number;
    maximumUsePerCustomer: number;
    validityStart: Date;
    validityEnd: Date;
  }[];
}

export interface ProductPromotionAttributes extends Document {
  Product: ObjectId;
  beginDate: string;
  endDate: string;
  deletedAt?: Date;
}
