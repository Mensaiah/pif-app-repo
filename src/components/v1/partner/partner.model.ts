import { Schema, model } from 'mongoose';

import { PartnerAttributes } from './partner.types';

const partnerSchema = new Schema<PartnerAttributes>({}, { timestamps: true });

const PartnerModel = model<PartnerAttributes>('Partner', partnerSchema);

export default PartnerModel;
