import { Schema, model } from 'mongoose';

import { ContactAttributes } from './contact.types';

const contactSchema = new Schema<ContactAttributes>(
  {
    old_id: Number,
    isLegacyData: Boolean,
    User: { type: Schema.Types.ObjectId, ref: 'User' },
    pifId: String,
    name: String,
    phoneNumber: String,
    phoneNumberDisplay: String,
    hasApp: Boolean,
    deletedAt: Date,
    countryCode: String,
  },
  { timestamps: true }
);

const ContactModel = model<ContactAttributes>('Contact', contactSchema);

export default ContactModel;
