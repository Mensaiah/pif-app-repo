import cors from 'cors';
import express, { Application } from 'express';
import Fingerprint from 'express-fingerprint';
import helmet from 'helmet';
import appConfig from './config';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app
      .use(express.json())
      .use(express.urlencoded({ extended: false }))
      .use(cors())
      .use(helmet())
      .use(Fingerprint());
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
