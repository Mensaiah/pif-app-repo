import { Document, Types } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';

export interface CategoryAttributes extends Document {
  name: LanguageValuePair[];
  isEnabled: boolean;
  isPromoted: boolean;
  isSupplierList: boolean;
  isMain: boolean;
  isFunctional: boolean;
  type: number;
  Icon: CategoryIconAttributes['_id'];
  isBirthday: boolean;
  deletedAt?: Date;
  marketplaces: Array<Types.ObjectId>;
}
export interface InterCategoryAttributes extends Document {
  name: LanguageValuePair[];
  deletedAt?: boolean;
  addedBy: Types.ObjectId;
}

export interface CategoryIconAttributes extends Document {
  name: string;
  iconifyName?: string;
  svg?: string;
  url?: string;
  isDisabled: boolean;
}
