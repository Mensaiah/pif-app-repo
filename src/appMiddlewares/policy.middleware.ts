import { NextFunction, Request, Response } from 'express';
import { Schema } from 'zod';

import { handleResponse } from '../utils/helpers';

const policyMiddleware =
  (schema: Schema, fieldType: 'body' | 'params' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      let parsedData;

      if (fieldType === 'body') {
        parsedData = schema.parse(req.body);
        req.body = parsedData;
      } else if (fieldType === 'params') {
        parsedData = schema.parse(req.params);
        req.params = parsedData;
      } else if (fieldType === 'query') {
        parsedData = schema.parse(req.query);
        req.query = parsedData;
      }

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
