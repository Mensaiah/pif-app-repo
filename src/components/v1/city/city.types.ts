import { Document } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';

export interface CityAttributes extends Document {
  old_id: number;
  isLegacyData: boolean;
  name: Array<LanguageValuePair>;
  isEnabled: boolean;
  x: number;
  y: number;
  deletedAt: Date;
  marketplace: string;
}
