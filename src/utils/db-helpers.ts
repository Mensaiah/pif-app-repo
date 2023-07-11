import { Schema } from 'mongoose';

export const languageValuePairSchema = new Schema({
  lang: {
    type: String,
    lowercase: true,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});
