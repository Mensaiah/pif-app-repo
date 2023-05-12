import { Document } from 'mongoose';

import { LanguageValuePair } from '../../../types/global';

export interface TagAttributes extends Document {
  name: LanguageValuePair[];
}
