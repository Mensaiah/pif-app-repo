import { Schema, model } from 'mongoose';

const infoBoxSchema = new Schema(
  {
    title: String,
    content: [
      {
        language: String,
        value: String,
      },
    ],
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

const legalPolicySchema = new Schema(
  {
    title: String,
    content: [
      {
        language: String,
        value: String,
      },
    ],
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

const faqSchema = new Schema(
  {
    question: String,
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

export const InfoBoxModel = model('InfoBox', infoBoxSchema);
export const LegalPolicyModel = model('LegalPolicy', legalPolicySchema);
export const FaqModel = model('Faq', faqSchema);
