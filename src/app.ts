import cors from 'cors';
import express, {
  Application,
  ErrorRequestHandler,
  NextFunction,
  Response,
} from 'express';
import Fingerprint from 'express-fingerprint';
import helmet from 'helmet';
import appConfig from './config';
import { consoleLog, handleResponse } from './utils/helpers';
import { IRequest, LanguageCode } from './types/global';
import { useWord } from './utils/wordSheet';
import { connectMongoDb } from './config/persistence/database';
import { seedNow } from './config/persistence/seeder';
import httpRequestLogger from './utils/httpRequestLogger';
import routesV1 from './components/v1/routes.v1';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializePersistenceAndSeeding();
  }

  private initializePersistenceAndSeeding() {
    connectMongoDb()
      .then(() => {
        seedNow();
      })
      .catch((err) => consoleLog(err, 'error'));
  }

  private initializeMiddlewares(): void {
    this.app
      .use(express.json({ limit: '1kb' }))
      .use(express.urlencoded({ limit: '1kb', extended: false }))
      .use(cors())
      .use(helmet())
      .use(Fingerprint())
      .use((req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.header(
            'Access-Control-Allow-Methods',
            'POST, PUT, PATCH, GET, DELETE'
          );
          return handleResponse(res, 'Invalid header method', 403);
        }

        return next();
      })
      .use(httpRequestLogger);

    // if (appConfig.isDev) this.app.use() // dev middlewares
    // if (appConfig.isProd) this.app.use() // production middlewares

    // pass lang as part of the request
    this.app.use('/v1/:lang', (req: IRequest, _res, next: NextFunction) => {
      let lang = String(req.params.lang).toLowerCase();
      if (!appConfig.supportedLanguages.includes(lang as LanguageCode))
        lang = 'en';
      req.lang = lang as LanguageCode;

      return next();
    });
  }

  private initializeRoutes(): void {
    this.app.use('/v1/:lang/', routesV1);
    this.app.get('/', (req, res) => {
      res.json({ message: 'Up and running in ' + appConfig.environment });
    });
    this.app.all('*', (_req, res: Response) =>
      handleResponse(
        res,
        'You have used an invalid method or hit an invalid route',
        404
      )
    );
    this.app.use((err: ErrorRequestHandler, req: IRequest, res: Response) => {
      return handleResponse(
        res,
        { message: useWord('internalServerError', req.lang), err: err },
        500,
        err
      );
    });
  }
}

const app = new App().app;

export default app;
module.exports = app;
