import { Document, Types } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';

export interface CategoryAttributes extends Document {
  old_id: number;
  isLegacyData: boolean;
  name: LanguageValuePair[];
  isEnabled: boolean;
  isPromoted: boolean;
  isSupplierList: boolean;
  isMain: boolean;
  isFunctional: boolean;
  type: number;
  isBirthday: boolean;
  deletedAt?: Date;
  marketplaces: Array<string>;
  Icon?: string;
  iconName?: string;
  iconUrl?: string;
}
export interface InternalCategoryAttributes extends Document {
  old_id: number;
  isLegacyData: boolean;
  name: LanguageValuePair[];
  isDeleted: boolean;
  deletedBy?: Types.ObjectId;
  addedBy: Types.ObjectId;
}

export interface CategoryIconAttributes extends Document {
  name: string;
  svg?: string;
  url?: string;
  isDisabled: boolean;
}
