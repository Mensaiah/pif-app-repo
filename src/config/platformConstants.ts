const platformConstants = {
  unlimited: -1,
  paymentProcessors: ['stripe', 'paystack', 'mobilePay', 'nets'] as const,
  paginationConfig: {
    perPage: 20,
    allowedPerPageValues: [20, 30, 50, 100] as const,
  },
  supportedLanguages: ['en', 'da', 'fr', 'sv', 'es'] as const,
};

export default platformConstants;
