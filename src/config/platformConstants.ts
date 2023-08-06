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
  defaultSettlementConfig: {
    startProportion: 50,
    finishProportion: 40,
    fixedFee: 0,
    pifProportion: 10,
  },
  walletTypes: ['system', 'partner'] as const,
  walletStatuses: ['active', 'suspended', 'closed'] as const,
  otpResendWaitingMinutes: 3,
};

export default platformConstants;
