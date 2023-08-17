import { Document } from 'mongoose';

import { CityAttributes } from '../../city/city.types';
import { PartnerAttributes } from '../../partner/partner.types';

export interface PartnerPosAttributes extends Document {
  old_id: number;
  Partner: PartnerAttributes['_id'];
  name: string; // alias POS ID on frontend
  lat: number;
  long: number;
  phone: string;
  phonePrefix: string;
  description: string;
  geoScanned: string;
  isActive: boolean;
  City: CityAttributes['_id'];
}
