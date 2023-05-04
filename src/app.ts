import cors from 'cors';
import express, {
  Application,
  ErrorRequestHandler,
  NextFunction,
  Response,
} from 'express';
import helmet from 'helmet';
import appConfig from './config';
import { consoleLog, handleResponse } from './utils/helpers';
import { IRequest, LanguageCode } from './types/global';
import { useWord } from './utils/wordSheet';
import { connectMongoDb } from './config/persistence/database';
import { seedNow } from './config/persistence/seeder';
import httpRequestLogger from './utils/httpRequestLogger';
import routesV1 from './components/v1/routes.v1';
import fingerprintMiddleware from './appMiddlewares/fingerprint.middleware';

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
    'https://pif-dashboard.web.app/',
  ];
  const corsOptions = {
    origin: function (origin: string, callback: (err: Error) => void) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };

  app
    .use(cors(corsOptions))
    .use(express.json({ limit: '1kb' }))
    .use(express.urlencoded({ limit: '1kb', extended: false }))
    .use(helmet())
    .use(fingerprintMiddleware)
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
    app.use(httpRequestLogger);
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
  app.use('/v1/:lang/', routesV1);
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
  app.use((err: ErrorRequestHandler, req: IRequest, res: Response) => {
    return handleResponse(
      res,
      { message: useWord('internalServerError', req.lang), err: err },
      500,
      err
    );
  });
};

initializePersistenceAndSeeding();
initializeMiddlewares();
initializeRoutes();

export default app;
module.exports = app;
