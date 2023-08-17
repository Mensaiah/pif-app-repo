import { Schema, model } from 'mongoose';

import { PartnerPosAttributes } from './partnerPos.types';

const partnerPosSchema = new Schema<PartnerPosAttributes>(
  {
    old_id: Number,
    Partner: {
      type: Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    name: String,
    lat: Number,
    long: Number,
    phone: String,
    phonePrefix: String,
    description: String,
    geoScanned: String,
    isActive: Boolean,
    City: {
      type: Schema.Types.ObjectId,
      ref: 'City',
    },
  },
  { timestamps: true }
);

export const PartnerPosModel = model<PartnerPosAttributes>(
  'PartnerPos',
  partnerPosSchema
);
