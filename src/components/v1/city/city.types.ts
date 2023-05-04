import { Document, ObjectId } from 'mongoose';
import { LanguageValuePair } from 'src/types/global';

export interface CityAttributes extends Document {
  name: Array<LanguageValuePair>;
  isEnabled: boolean;
  x: number;
  y: number;
  deletedAt: Date;
  Marketplace: ObjectId;
}
