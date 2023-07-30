import PlatformModel from './platform.model';
import { PlatformAttributes } from './platform.types';

export const filterMarketplaces = (
  marketplaces: string[],
  platform: PlatformAttributes
) => [
  ...new Set(
    marketplaces.filter((marketplace) => {
      const marketplaceExists = platform.marketplaces.find(
        ({ code }) =>
          code.toLocaleLowerCase() === marketplace.toLocaleLowerCase()
      );

      return Boolean(marketplaceExists);
    })
  ),
];

export const getMarketplaceCurrency = async (marketplace: string) => {
  const platformData = await PlatformModel.findOne().sort({ createdAt: -1 });

  if (!platformData) return null;

  const marketplaceExists = platformData.marketplaces?.find(
    ({ code }) => code === marketplace
  );

  if (!marketplaceExists) return null;

  return marketplaceExists.currencyCode;
};

export const isStripeSupportedInMarketplace = async (marketplace: string) => {
  const platformData = await PlatformModel.findOne().sort({ createdAt: -1 });

  if (!platformData) return false;

  const marketplaceExists = platformData.marketplaces?.find(
    ({ code }) => code === marketplace
  );

  if (!marketplaceExists) return false;

  return marketplaceExists.paymentProcessors.includes('stripe');
};
