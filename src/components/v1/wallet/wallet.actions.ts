import { Response } from 'express';
import { FilterQuery } from 'mongoose';

import platformConstants from '../../../config/platformConstants';
import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import {
  getMarketplaceQuery,
  getPartnerQuery,
  handleReqSearch,
} from '../../../utils/queryHelpers';
import PlatformModel from '../platform/platform.model';

import WalletModel from './wallet.model';
import { WalletAttributes } from './wallet.type';

type WalletType = (typeof platformConstants.walletTypes)[number];
type WalletStatusType = (typeof platformConstants.walletStatuses)[number];

export const getWallets = async (req: IRequest, res: Response) => {
  try {
    const { user, userAccess, userType } = req;
    const { marketplace, partner_id, wallet_type, status } = handleReqSearch(
      req,
      {
        marketplace: 'string',
        partner_id: 'string',
        wallet_type: 'string',
        status: 'string',
      }
    );

    const marketplaceQuery = getMarketplaceQuery(req, marketplace);
    const partnerQuery = await getPartnerQuery(req, partner_id);

    if (req.sendEmptyData) return handleResponse(res, { data: [] });

    if (
      status &&
      !platformConstants.walletStatuses.includes(status as WalletStatusType)
    ) {
      return handleResponse(res, {
        data: [],
      });
    }

    if (wallet_type) {
      if (!platformConstants.walletTypes.includes(wallet_type as WalletType)) {
        return handleResponse(res, {
          data: [],
        });
      } else if (wallet_type === 'system') {
        if (userType !== 'platform-admin') {
          return handleResponse(res, {
            data: [],
          });
        }
      }
    }

    if (userType !== 'platform-admin' && wallet_type === 'system') {
      return handleResponse(res, { data: [] });
    }

    const query: FilterQuery<WalletAttributes & Document> = {
      ...marketplaceQuery,
      ...partnerQuery,
      ...(wallet_type && { walletType: wallet_type }),
      ...(status && { status }),
    };

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
