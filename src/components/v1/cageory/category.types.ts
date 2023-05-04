import { Document, ObjectId } from 'mongoose';
import { LanguageValuePair } from 'src/types/global';
import { UserAttributes } from '../user/user.types';

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
  marketplaces: Array<ObjectId>;
}
export interface InterCategoryAttributes extends Document {
  name: LanguageValuePair[];
  deletedAt?: boolean;
  addedBy: UserAttributes['_id'];
}

export interface CategoryIconAttributes extends Document {
  name: string;
  iconifyName?: string;
  svg?: string;
  url?: string;
  isDisabled: boolean;
}
