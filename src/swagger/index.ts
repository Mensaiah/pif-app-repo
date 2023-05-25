import fs from 'fs';
import path from 'path';

import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import { searchFiles } from '../utils/helpers';

const endpointsDir = searchFiles(
  path.resolve(__dirname, '../../src/components'),
  '.swagger.yaml'
);

const endpoints = [];

for (const file of endpointsDir) {
  const endpointFile = fs.readFileSync(file, 'utf8');
  const endpoint = YAML.parse(endpointFile);

  endpoints.push(endpoint);
}

const swaggerApp: Application = express();

const swaggerDocs = {
  openapi: '3.0.0',
  info: {
    title: 'PIf API',
    version: '1.0.0',
  },
  servers: [{ url: '/v1/en' }],
  paths: Object.assign({}, ...endpoints),
};

swaggerApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default swaggerApp;
