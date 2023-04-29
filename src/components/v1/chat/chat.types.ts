import { Document, ObjectId } from 'mongoose';

export interface ChatAttributes extends Document {
  senderId: ObjectId;
  receiveerId: ObjectId;
  isDelivered?: boolean;
  isRead?: boolean;
  senderPifId: string;
  receiverPifId: string;
  message: string;
  attachments: {
    photo?: string;
    audio?: string;
    file?: string;
    pif?: ObjectId;
  };
  isDeletedForSender?: boolean;
  isDeletedForReceiver?: boolean;
}
