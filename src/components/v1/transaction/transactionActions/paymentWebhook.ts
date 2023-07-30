import { Request, Response } from 'express';

import PaystackService from '../../../../services/paymentProcessors/paystack.service';

const paymentWebhookHandler = async (req: Request, res: Response) => {
  const { driver } = req.params;

  if (driver === 'paystack') PaystackService.paystackWebhook(req, res);
};

export default paymentWebhookHandler;
