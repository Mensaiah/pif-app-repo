// Generated by CodiumAI

import { Response } from 'express';

import { getPurchases } from '../../../../components/v1/purchase/purchase.action';
import PurchaseModel from '../../../../components/v1/purchase/purchase.model';
import platformConstants from '../../../../config/platformConstants';
import { IRequest } from '../../../../types/global';

describe('getPurchases_function', () => {
  it('returns purchases and pagination meta data when valid query parameters are provided', async () => {
    const req = {
      query: {
        marketplace: 'us',
        partner_id: 'partner_id',
        product_id: 'product_id',
        user_id: 'user_id',
        currency: 'USD',
      },
    } as unknown as IRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const purchases = [
      { id: 1, name: 'Purchase 1' },
      { id: 2, name: 'Purchase 2' },
    ];
    const count = purchases.length;

    PurchaseModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(purchases),
      }),
    });
    PurchaseModel.countDocuments = jest.fn().mockResolvedValue(count);

    await getPurchases(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: purchases,
      meta: {
        totalRows: count,
        totalPages: 1,
        currentPage: 1,
        perPage: platformConstants.paginationConfig.allowedPerPageValues[0],
        nextPage: null,
        prevPage: null,
      },
    });
  });

  it('returns an error response when a partner-admin user tries to query by user id', async () => {
    const req = {
      query: {
        user_id: 'user_id',
      },
      userType: 'partner-admin',
      userAccess: {
        role: 'partner-admin',
      },
    } as unknown as IRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await getPurchases(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You are not allowed to perform this operation',
    });
  });

  // Tests that an empty data in response is returned when an invalid marketplace is provided

  // Tests that query is ignored query made when an invalid currency is provided
});
