import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import PlatformModel from '../platform/platform.model';

import WalletModel from './wallet.model';
import { WalletAttributes } from './wallet.type';

export const getWallets = async (req: IRequest, res: Response) => {
  try {
    const { user, userAccess, role, userType } = req;

    const query: FilterQuery<WalletAttributes & Document> = {};

    if (userType === 'platform-admin') {
      query.walletType = 'system';

      if (!['super-admin', 'admin'].includes(role)) {
        query.marketplaces = { $in: userAccess.marketplaces };
      }
    }
    if (userType === 'partner-admin') {
      query.walletType = 'partner';
      query.partner = user.Partner;
    }

    let wallets = await WalletModel.find(query);

    if (wallets.length === 0) {
      if (userType === 'partner-admin') {
        const platform = await PlatformModel.findOne().sort({ createdAt: -1 });

        if (!platform)
          return handleResponse(
            res,
            'Could not fetch wallet data at this time'
          );

        wallets = await Promise.all(
          userAccess.marketplaces.map(async (marketplace) => {
            const wallet = await new WalletModel({
              Partner: user.Partner,
              currency: platform.marketplaces.find(
                (m) => m.code === marketplace
              )?.currencyCode,
              marketplace,
            }).save();

            return wallet;
          })
        );
      }
    }

    if (wallets.length === 1 && userType === 'partner-admin') {
      return handleResponse(res, { data: wallets[0] });
    }

    return handleResponse(res, { data: wallets });
  } catch (err) {
    handleResponse(
      res,
      'An error occurred while trying to get wallets data',
      500,
      err
    );
  }
};
