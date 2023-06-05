export interface MarketplaceAttributes {
  name: string;
  code: string;
  currency: string;
  currencyCode: string;
  language: string;
  languageCode: string;
  isDisabled?: boolean;
  currencySymbol: string;
}
export interface PlatformAttributes {
  version: string;
  marketplaces: MarketplaceAttributes[];
  socials?: Array<{
    name: string;
    url: string;
  }>;
}
