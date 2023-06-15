import { Schema, model } from 'mongoose';

import { MarketplaceAttributes, PlatformAttributes } from './platform.types';

const marketplaceSchema = new Schema<MarketplaceAttributes>({
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    uppercase: true,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  currencyCode: {
    uppercase: true,
    type: String,
    trim: true,
  },
  language: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  languageCode: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  currencySymbol: {
    type: String,
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
    defaultUserTypesAndRoles: [
      {
        userType: String,
        roles: [
          {
            name: String,
            permissions: [String],
          },
        ],
      },
    ],
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
