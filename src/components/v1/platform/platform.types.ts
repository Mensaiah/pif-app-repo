export interface MarketplaceAttributes {
  name: string;
  code: string;
  currency: string;
  currencyCode: string;
  language: string;
  languageCode: string;
}
export interface PlatformAttributes {
  version: string;
  marketplaces: MarketplaceAttributes[];
}
