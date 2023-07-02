import { Schema, model } from 'mongoose';

import { languageValuePairSchema } from '../../../utils/db-helpers';

import { CityAttributes } from './city.types';

export const citySchema = new Schema<CityAttributes>({
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
});

const CityModel = model<CityAttributes>('City', citySchema);

export default CityModel;
