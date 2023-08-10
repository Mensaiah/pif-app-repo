import { Schema, model } from 'mongoose';

import { languageValuePairSchema } from '../../../utils/db-helpers';

import {
  CategoryAttributes,
  CategoryIconAttributes,
  InternalCategoryAttributes,
} from './category.types';

const categorySchema = new Schema<CategoryAttributes>(
  {
    old_id: Number,
    isLegacyData: Boolean,
    name: [languageValuePairSchema],
    isEnabled: Boolean,
    isPromoted: Boolean,
    isSupplierList: Boolean,
    isMain: Boolean,
    isFunctional: Boolean,
    type: Number,
    Icon: String,
    isBirthday: Boolean,
    deletedAt: Date,
    marketplaces: [String],
  },
  { timestamps: true }
);

//  iconifyName: String,
//     svg: String,
//     url: String,

export const CategoryModel = model<CategoryAttributes>(
  'Category',
  categorySchema
);

const InternalCategorySchema = new Schema<InternalCategoryAttributes>(
  {
    old_id: Number,
    isLegacyData: Boolean,
    name: [languageValuePairSchema],
    isDeleted: Boolean,
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const InternalCategoryModel = model<InternalCategoryAttributes>(
  'InternalCategory',
  InternalCategorySchema
);

const categoryIconSchema = new Schema<CategoryIconAttributes>(
  {
    name: String,
    svg: String,
    url: String,
    isDisabled: Boolean,
  },
  { timestamps: true }
);

export const CategoryIconModel = model<CategoryIconAttributes>(
  'CategoryIcon',
  categoryIconSchema
);
