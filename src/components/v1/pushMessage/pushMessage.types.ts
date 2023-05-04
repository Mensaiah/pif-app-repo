import { Document } from 'mongoose';
import { UserAttributes } from '../user/user.types';
import { PartnerAttributes } from '../partner/partner.types';

export interface PushMessageAttributes extends Document {
  criteria: any;
  message: string;
  numberOfRecipients: number;
  sender: UserAttributes['_id'] | string;
  Partner?: PartnerAttributes['_id'];
}
