export interface CreatePaymentLinkResponseProps {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponseProps {
  status: boolean;
  message: string;
  data: VerifyPaymentDataProps;
}

export interface VerifyPaymentDataProps {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: null;
  gateway_response: string;
  paid_at: Date;
  created_at: Date;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: string;
  log: VerifyPaymentLogProps;
  fees: number;
  fees_split: null;
  authorization: VerifyPaymentAuthorizationProps;
  customer: VerifyPaymentCustomerProps;
  plan: null;
  order_id: null;
  paidAt: Date;
  createdAt: Date;
  requested_amount: number;
  pos_transaction_data: null;
  source: null;
  fees_breakdown: null;
  transaction_date: Date;
}

export interface VerifyPaymentAuthorizationProps {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: null;
}

export interface VerifyPaymentCustomerProps {
  id: number;
  first_name: null;
  last_name: null;
  email: string;
  customer_code: string;
  phone: null;
  metadata: null;
  risk_action: string;
  international_format_phone: null;
}

export interface VerifyPaymentLogProps {
  start_time: number;
  time_spent: number;
  attempts: number;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: unknown[];
  history: VerifyPaymentHistoryProps[];
}

export interface VerifyPaymentHistoryProps {
  type: string;
  message: string;
  time: number;
}

export interface ListBankProps {
  status: boolean;
  message: string;
  data: ListBankDataProps[];
}

export interface ListBankDataProps {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResolveAcctNoProps {
  status: boolean;
  message: string;
  data: ResolveAcctNoDataProps;
}

export interface ResolveAcctNoDataProps {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export interface CreateTransferRecipientType {
  status: boolean;
  message: string;
  data: CreateTransferRecipientDataType;
}

export interface CreateTransferRecipientDataType {
  active: boolean;
  createdAt: Date;
  currency: string;
  domain: string;
  id: number;
  integration: number;
  name: string;
  recipient_code: string;
  type: string;
  updatedAt: Date;
  is_deleted: boolean;
  details: CreateTransferRecipientDetailsType;
}

export interface CreateTransferRecipientDetailsType {
  authorization_code: null;
  account_number: string;
  account_name: null;
  bank_code: string;
  bank_name: string;
}

export type InitiatePaymentReturnType = Promise<{
  paymentLink?: string;
  errorMessage?: string;
  paymentId?: string;
  driverReference?: string;
}>;

export type VerifyPaymentReturnType = Promise<{
  success: boolean;
  errorMessage?: string;
  grossAmount?: number;
  txFee?: number;
  netAmount?: number;
  receiptUrl?: string;
  chargeCurrency?: string;
}>;
