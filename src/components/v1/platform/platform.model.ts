import { Schema, model } from 'mongoose';
import { MarketplaceAttributes, PlatformAttributes } from './platform.types';

const marketplaceSchema = new Schema<MarketplaceAttributes>({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  languageCode: {
    type: String,
    required: true,
  },
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
  },
  { timestamps: true }
);

const PlatformModel = model<PlatformAttributes>('Platform', platformSchema);

export default PlatformModel;
