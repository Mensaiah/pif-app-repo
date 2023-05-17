import { Document, ObjectId } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';
import {
  CategoryAttributes,
  InterCategoryAttributes,
} from '../category/category.types';
import { CityAttributes } from '../city/city.types';
import { PartnerAttributes } from '../partner/partner.types';

export interface ProductAttributes extends Document {
  name: LanguageValuePair[];
  caption: LanguageValuePair[];
  description: LanguageValuePair[];
  disclaimer: LanguageValuePair[];
  textForReceiver: LanguageValuePair[];
  tags: string[];
  Partner: PartnerAttributes['_id'];
  price: number;
  isApproved: boolean;
  marketplace: ObjectId;
  photo: string;
  productType: 'regular product' | 'free gift';
  categories: CategoryAttributes['_id'][];
  internalCategory: InterCategoryAttributes['_id'];
  redemptionValidityType: 'date' | 'period';
  redemptionValidityPeriodType: 'day' | 'weeks' | 'months';
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
  cities: CityAttributes['_id'][];
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
}

export interface ProductPromotionAttributes extends Document {
  Product: ProductAttributes['_id'];
  beginDate: string;
  endDate: string;
  deletedAt?: Date;
}
