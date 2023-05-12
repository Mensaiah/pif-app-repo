import { NextFunction, Request, Response } from 'express';
import { Schema } from 'zod';

import { handleResponse } from '../utils/helpers';

const policyMiddleware =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody;

      return next();
    } catch (err) {
      return handleResponse(
        res,
        {
          message: `${
            err.issues[0].path[0]
          } ${err.issues[0].message.toLowerCase()}`,
        },
        400
      );
    }
  };

export default policyMiddleware;
