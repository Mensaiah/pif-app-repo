import platformConstants from '../../../config/platformConstants';

export interface MarketplaceAttributes {
  name: string;
  code: string;
  currency: string;
  currencyCode: string;
  language: string;
  languageCode: string;
  isDisabled?: boolean;
  currencySymbol: string;
  paymentProcessors: Array<PaymentDriverType>;
  socials: Array<{
    name: string;
    url: string;
  }>;
  allowPartnersToWithdrawEarning?: boolean;
}
export type PaymentDriverType =
  (typeof platformConstants.paymentProcessors)[number];

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
  socials: MarketplaceAttributes['socials'];
}
