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
