import { Schema, model } from 'mongoose';

import { languageValuePairSchema } from '../../../utils/db-helpers';

import { CityAttributes } from './city.types';

export const citySchema = new Schema<CityAttributes>(
  {
    old_id: Number,
    isLegacyData: Boolean,
    name: [languageValuePairSchema],
    isEnabled: {
      type: Boolean,
      default: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    deletedAt: Date,
    marketplace: String,
  },
  { timestamps: true }
);

const CityModel = model<CityAttributes>('City', citySchema);

export default CityModel;
