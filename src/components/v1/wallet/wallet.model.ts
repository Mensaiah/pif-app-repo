import { Schema, model } from 'mongoose';

import { WalletAttributes } from './wallet.type';

const walletSchema = new Schema<WalletAttributes>(
  {
    Partner: { type: Schema.Types.ObjectId, ref: 'Partner' },
    User: { type: Schema.Types.ObjectId, ref: 'User' },
    currency: { type: String, required: true },
    balance: { type: Number, default: 0 },
    amountOnHold: { type: Number, default: 0 },
    marketplace: { type: String, required: true },
    totalIncome: { type: Number, default: 0 },
    totalWithdrawal: { type: Number, default: 0 },
    amountThreshold: { type: Number, default: 0 },
    walletType: {
      type: String,
      enum: ['system', 'partner', 'user'],
      default: 'partner',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

const WalletModel = model<WalletAttributes>('Wallet', walletSchema);

export default WalletModel;
