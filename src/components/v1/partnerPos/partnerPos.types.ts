import { Document } from 'mongoose';
import { PartnerAttributes } from '../partner/partner.types';
import { CityAttributes } from '../city/city.types';

export interface PartnerPosAttributes extends Document {
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
