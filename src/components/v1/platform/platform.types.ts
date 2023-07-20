export interface MarketplaceAttributes {
  name: string;
  code: string;
  currency: string;
  currencyCode: string;
  language: string;
  languageCode: string;
  isDisabled?: boolean;
  currencySymbol: string;
  paymentProcessors: Array<'paystack' | 'stripe' | 'netAxept'>;
  socials?: Array<{
    name: string;
    url: string;
  }>;
}
export interface PlatformAttributes {
  version: string;
  marketplaces: MarketplaceAttributes[];
  defaultUserTypesAndRoles: Array<{
    userType: string;
    roles: Array<{
      name: string;
      permissions?: string[];
    }>;
  }>;
  socials?: Array<{
    name: string;
    url: string;
  }>;
  numericIdTrackers?: {
    lastPartnerId?: number;
  };
}
