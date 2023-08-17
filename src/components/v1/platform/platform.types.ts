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

export interface DashboardCardData {
  name: string;
  value: number;
  difference: number;
  percentageChange: number;
}

export type DashboardChartData = Record<string, Array<Record<string, string>>>;

export type LowStockAlertData = Record<string, Array<Record<string, string>>>;
export interface DashboardData {
  cards: Array<DashboardCardData>;
  charts: Array<DashboardChartData>;
  tables: Array<any>;
  lowStockAlert: Array<LowStockAlertData>;
}

export interface TimeFilter {
  $gte?: Date;
  $lte?: Date;
}
