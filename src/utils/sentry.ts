import * as Sentry from '@sentry/node';
import { Application } from 'express';

import appConfig from '../config';

const useSentry = (app: Application) => {
  Sentry.init({
    dsn: appConfig.sentryDSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({
        tracing: true,
      }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({
        app,
      }),
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    environment: appConfig.isDev
      ? 'development'
      : appConfig.isStaging
      ? 'staging'
      : appConfig.isTesting
      ? 'test'
      : 'production',
    // Performance Monitoring
    // Capture 100% of the transactions, reduce in production!
    tracesSampleRate: 1.0,
    // release: 'my-project-name@2.3.12', // track releases
  });

  return Sentry;
};

export default useSentry;
