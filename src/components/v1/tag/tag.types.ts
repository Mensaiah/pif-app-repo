import { Document } from 'mongoose';
import { LanguageValuePair } from 'src/types/global';

export interface TagAttributes extends Document {
  name: LanguageValuePair[];
}
