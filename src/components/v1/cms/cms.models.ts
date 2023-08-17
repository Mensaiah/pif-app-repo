import { Schema, model } from 'mongoose';

import { languageValuePairSchema } from '../../../utils/db-helpers';

import {
  FaqAttribute,
  InfoBoxAttributes,
  LegalPolicyAttributes,
} from './cms.types';

const infoBoxSchema = new Schema<InfoBoxAttributes>(
  {
    title: String,
    content: [languageValuePairSchema],
    icon: {
      iconifyName: String,
      svg: String,
      url: String,
    },
    isPublished: Boolean,
    deletedAt: Date,
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const legalPolicySchema = new Schema<LegalPolicyAttributes>(
  {
    title: String,
    content: [languageValuePairSchema],
    isPublished: Boolean,
    deletedAt: Date,
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const faqSchema = new Schema<FaqAttribute>(
  {
    question: [languageValuePairSchema],
    answer: String,
    isDraft: Boolean,
    AddedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const InfoBoxModel = model<InfoBoxAttributes>('InfoBox', infoBoxSchema);
export const LegalPolicyModel = model<LegalPolicyAttributes>(
  'LegalPolicy',
  legalPolicySchema
);
export const FaqModel = model<FaqAttribute>('Faq', faqSchema);
