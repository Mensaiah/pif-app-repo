import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Response } from 'express';
import helmet from 'helmet';
// import mongoose from 'mongoose';
// import { RateLimiterMongo } from 'rate-limiter-flexible';

import fingerprintMiddleware from './appMiddlewares/fingerprint.middleware';
import routerV1 from './components/v1/routes.v1';
import appConfig from './config';
import { connectMongoDb } from './config/persistence/database';
import { seedNow } from './config/persistence/seeder';
import swaggerApp from './swagger';
import { IRequest, LanguageCode } from './types/global';
import { consoleLog, handleResponse } from './utils/helpers';
import httpRequestLogger from './utils/httpRequestLogger';

const app: Application = express();

const initializePersistenceAndSeeding = () => {
  connectMongoDb()
    .then(() => {
      seedNow();
    })
    .catch((err) => consoleLog(err, 'error'));
};

const initializeMiddlewares = () => {
  const allowedOrigins = [
    'http://localhost:5173',
    `http:localhost:${appConfig.port}`,
    'https://pif-dashboard.web.app',
  ];
  const corsOptions = {
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  // const rateLimiter = new RateLimiterMongo({
  //   storeClient: mongoose.connection,
  //   points: 1000, // Number of points
  //   duration: 60 * 15, // Per 15 minutes, expressed as 60 seconds/minute * 15 minutes
  //   tableName: 'rateLimiter', // Table name for saving rate limit data
  // });

  app
    // .use((req, res, next) => {
    //   rateLimiter
    //     .consume(req.ip)
    //     .then(() => {
    //       next();
    //     })
    //     .catch((_) => {
    //       return handleResponse(
    //         res,
    //         'Too Many Requests, try again after some time',
    //         429
    //       );
    //     });
    // })
    .use(cors(corsOptions))
    .use(cookieParser())
    .use(express.json({ limit: '1kb' }))
    .use(express.urlencoded({ limit: '1kb', extended: false }))
    .use(helmet())
    .use(fingerprintMiddleware) // TODO: fix lat & long
    .use(swaggerApp)
    .use((req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.header(
          'Access-Control-Allow-Methods',
          'POST, PUT, PATCH, GET, DELETE'
        );
        return handleResponse(res, 'Invalid header method', 403);
      }

      return next();
    });

  // dev middlewares
  if (appConfig.isDev) {
    app.use(httpRequestLogger); // TODO: look into logger for dev & prod
  }

  // pass lang as part of the request
  app.use('/v1/:lang', (req: IRequest, _res, next: NextFunction) => {
    let lang = String(req.params.lang).toLowerCase();
    if (!appConfig.supportedLanguages.includes(lang as LanguageCode))
      lang = 'en';
    req.lang = lang as LanguageCode;

    return next();
  });
};

const initializeRoutes = () => {
  app.use('/v1/:lang/', routerV1);
  app.get('/', (_req, res) => {
    res.json({ message: 'Up and running in ' + appConfig.environment });
  });
  app.all('*', (_req, res: Response) =>
    handleResponse(
      res,
      'You have used an invalid method or hit an invalid route',
      404
    )
  );
};

initializePersistenceAndSeeding();
initializeMiddlewares();
initializeRoutes();

export default app;
module.exports = app;
