import { Response } from 'express';

import PaystackService from '../../../../services/paymentProcessors/paystack.service';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import { useWord } from '../../../../utils/wordSheet';

const listBanks = async (req: IRequest, res: Response) => {
  const { driver, marketplace } = handleReqSearch(req, {
    driver: 'string',
    marketplace: 'string',
  });

  try {
    if (driver !== 'paystack')
      return handleResponse(res, 'Only paystack is supported for now.', 400);

    if (marketplace !== 'ng')
      return handleResponse(res, 'Only Nigeria is supported for now.', 400);

    const banks = await PaystackService.listBanks();

    return handleResponse(res, { data: banks.data });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default listBanks;
