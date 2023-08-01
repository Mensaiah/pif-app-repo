import { Response } from 'express';

import { getWallets } from '../../../../components/v1/wallet/wallet.actions';
import WalletModel from '../../../../components/v1/wallet/wallet.model';
import { IRequest } from '../../../../types/global';

describe('getWallets', () => {
  it('returns wallets data when query is successful', async () => {
    const req = {
      userType: 'platform-admin',
      userAccess: {
        marketplaces: ['marketplace1', 'marketplace2'],
      },
      role: 'super-admin',
    } as unknown as IRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    WalletModel.find = jest.fn().mockResolvedValueOnce([
      {
        walletType: 'system',
        marketplaces: ['marketplace1', 'marketplace2'],
      },
    ]);

    await getWallets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [
        {
          walletType: 'system',
          marketplaces: ['marketplace1', 'marketplace2'],
        },
      ],
    });
  });

  it('returns a single wallet data when there is only one wallet and user is a partner-admin', async () => {
    const req = {
      userType: 'partner-admin',
      user: {
        Partner: 'partnerId',
      },
    } as unknown as IRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const wallets = [
      { Partner: 'partnerId', currency: 'USD', marketplace: 'marketplace1' },
    ];

    WalletModel.find = jest.fn().mockResolvedValueOnce(wallets);
    await getWallets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: wallets[0] });
  });

  it('returns an error message when wallet data could not be fetched', async () => {
    const req = {
      userType: 'partner-admin',
      user: {
        Partner: 'partnerId',
      },
    } as unknown as IRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    WalletModel.find = jest.fn().mockRejectedValueOnce('error');
    await getWallets(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'An error occurred while trying to get wallets data',
    });
  });

  it('returns empty array when there are no wallets', async () => {
    const req = {
      userType: 'platform-admin',
      userAccess: {
        marketplaces: ['marketplace1', 'marketplace2'],
      },
      role: 'super-admin',
    } as unknown as IRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    WalletModel.find = jest.fn().mockResolvedValueOnce([]);
    await getWallets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('filters wallets by marketplaces when user is a platform-admin and role is not super-admin or admin', async () => {
    const req = {
      userType: 'platform-admin',
      userAccess: {
        marketplaces: ['marketplace1', 'marketplace2'],
      },
      role: 'some-role',
    } as unknown as IRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    WalletModel.find = jest.fn().mockResolvedValueOnce([
      {
        walletType: 'system',
        marketplace: 'marketplace1',
      },
      {
        walletType: 'system',
        marketplaces: 'marketplace2',
      },
    ]);

    await getWallets(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [
        {
          walletType: 'system',
          marketplace: 'marketplace1',
        },
        {
          walletType: 'system',
          marketplaces: 'marketplace2',
        },
      ],
    });
  });
});
