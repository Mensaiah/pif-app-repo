const platformConstants = {
  unlimited: -1,
  paymentProcessors: ['stripe', 'paystack', 'mobilePay', 'nets'] as const,
  paginationConfig: {
    perPage: 20,
    allowedPerPageValues: [20, 30, 50, 100] as const,
  },
  supportedLanguages: ['en', 'da', 'fr', 'sv', 'es'] as const,
  otpPurpose: [
    'signup',
    'pin-reset',
    'password-reset',
    'confirm-account',
  ] as const,
  topAdminRoles: ['super-admin', 'admin'] as const,
};

export default platformConstants;
