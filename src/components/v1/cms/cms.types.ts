import { Document, ObjectId } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';

export interface InfoBoxAttributes extends Document {
  title: string;
  content: LanguageValuePair[];
  icon: {
    iconifyName?: string;
    svg?: string;
    url?: string;
  };
  isPublished: boolean;
  deletedAt: boolean;
  CreatedBy: ObjectId;
  LastEditedBy: ObjectId;
}

export interface LegalPolicyAttributes extends Document {
  title: string;
  content: LanguageValuePair[];
  isPublished: boolean;
  deletedAt: boolean;
  CreatedBy: ObjectId;
  LastEditedBy: ObjectId;
}

export interface FaqAttribute extends Document {
  question: LanguageValuePair[];
  answer: LanguageValuePair[];
  isDraft: boolean;
  AddedBy: ObjectId;
  LastEditedBy: ObjectId;
}
