import { Schema, model } from 'mongoose';

import { CityAttributes } from './city.types';

export const citySchema = new Schema<CityAttributes>({
  name: [
    {
      language: {
        type: String,
        lowercase: true,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
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
  Marketplace: {
    type: Schema.Types.ObjectId,
    ref: 'Marketplace',
  },
});

const CityModel = model<CityAttributes>('City', citySchema);

export default CityModel;
