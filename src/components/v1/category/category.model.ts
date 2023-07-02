import { Schema, model } from 'mongoose';

import { languageValuePairSchema } from '../../../utils/db-helpers';

import {
  CategoryAttributes,
  CategoryIconAttributes,
  InternalCategoryAttributes,
} from './category.types';

const categorySchema = new Schema<CategoryAttributes>({
  name: [languageValuePairSchema],
  isEnabled: Boolean,
  isPromoted: Boolean,
  isSupplierList: Boolean,
  isMain: Boolean,
  isFunctional: Boolean,
  type: Number,
  Icon: {
    iconifyName: String,
    svg: String,
    url: String,
  },
  isBirthday: Boolean,
  deletedAt: Date,
  marketplaces: [String],
});

export const CategoryModel = model<CategoryAttributes>(
  'Category',
  categorySchema
);

const InternalCategorySchema = new Schema<InternalCategoryAttributes>({
  name: [languageValuePairSchema],
  isDeleted: Boolean,
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const InternalCategoryModel = model<InternalCategoryAttributes>(
  'InternalCategory',
  InternalCategorySchema
);

const categoryIconSchema = new Schema<CategoryIconAttributes>({
  name: String,
  svg: String,
  url: String,
  isDisabled: Boolean,
});

export const CategoryIconModel = model<CategoryIconAttributes>(
  'CategoryIcon',
  categoryIconSchema
);
