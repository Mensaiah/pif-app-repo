import { Schema, model } from 'mongoose';

import { MarketplaceAttributes, PlatformAttributes } from './platform.types';

const marketplaceSchema = new Schema<MarketplaceAttributes>({
  name: {
    type: String,
    lowercase: true,
    required: true,
  },
  code: {
    type: String,
    uppercase: true,
    required: true,
  },
  currency: {
    type: String,
    lowercase: true,
    required: true,
  },
  currencyCode: {
    lowercase: true,
    type: String,
  },
  language: {
    type: String,
    lowercase: true,
    required: true,
  },
  currencySymbol: {
    type: String,
  },
  languageCode: {
    type: String,
    lowercase: true,
    required: true,
  },
  isDisabled: Boolean,
});

const platformSchema = new Schema<PlatformAttributes>(
  {
    version: {
      type: String,
      required: true,
    },
    marketplaces: {
      type: [marketplaceSchema],
      required: true,
    },
    socials: [
      {
        name: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

const PlatformModel = model<PlatformAttributes>('Platform', platformSchema);

export default PlatformModel;
