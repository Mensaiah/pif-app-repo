const platformConstants = {
  unlimited: -1,
  paymentProcessors: ['stripe', 'paystack', 'mobilePay', 'nets'] as const,
  paginationConfig: {
    perPage: 20,
    allowedPerPageValues: [20, 30, 50, 100] as const,
  },
  supportedLanguages: ['en', 'da', 'fr', 'sv', 'es', 'uk', 'it'] as const,
  otpPurpose: [
    'signup',
    'pin-reset',
    'password-reset',
    'confirm-account',
  ] as const,
  topAdminRoles: ['super-admin', 'admin'] as const,
  platformUserTypes: ['customer', 'partner-admin', 'platform-admin'] as const,
  defaultSettlementConfig: {
    startProportion: 50,
    finishProportion: 40,
    fixedFee: 0,
    pifProportion: 10,
  },
  walletTypes: ['system', 'partner'] as const,
  walletStatuses: ['active', 'suspended', 'closed'] as const,
  payoutStatuses: [
    'pending',
    'completed',
    'cancelled',
    'partially-paid',
  ] as const,
  partnerPayoutStatuses: ['pending', 'paid'] as const,
  payoutTypes: ['manual', 'auto'] as const,
  partnerPayoutItemTypes: ['start', 'finish', 'full'] as const,
  otpResendWaitingMinutes: 3,
};

export default platformConstants;
