import cors from 'cors';
import express, { Application } from 'express';
import Fingerprint from 'express-fingerprint';
import helmet from 'helmet';
import appConfig from './config';
import { connectDb } from './utils/database';
import { consoleLog, handleResponse } from './utils/helpers';
import { seedNow } from './utils/seeding';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializePersistenceAndSeeding();
  }

  private initializePersistenceAndSeeding() {
    connectDb()
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
      });

    // if (appConfig.isDev) this.app.use() // dev middlewares
    // if (appConfig.isProd) this.app.use() // production middlewares

    // pass lang as part of the request
    this.app.use('/v1/:lang', (req: IRequest, _res, next: NextFunction) => {
      let lang = String(req.params.lang).toLowerCase();
      if (!appConfig.supportedLanguages.includes(lang)) lang = 'en';
      req.lang = lang as ISupportedLang;

      return next();
    });
  }

  private initializeRoutes(): void {
    // Add your routes here
    this.app.get('/', (req, res) => {
      res.json({ message: 'Hello people from ' + appConfig.environment });
    });
  }
}

const app = new App().app;

export default app;
module.exports = app;
