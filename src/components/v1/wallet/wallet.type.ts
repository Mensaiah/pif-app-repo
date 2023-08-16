import { Types } from 'mongoose';

export interface WalletAttributes {
  Partner?: Types.ObjectId;
  User?: Types.ObjectId;
  currency: string;
  balance?: number;
  amountOnHold?: number;
  marketplace: string;
  totalIncome?: number;
  totalWithdrawal?: number;
  walletType?: 'system' | 'partner' | 'user';
  status?: 'active' | 'suspended' | 'closed';
  amountThreshold?: number;
}

// a system wallet will be created for each marketplace and the amount field will be PIF income, the pendingAmount will be the escrow balance
// a wallet will be created for each partner and the amount field will be the partner's revenue, the pendingAmount will be the escrow balance
