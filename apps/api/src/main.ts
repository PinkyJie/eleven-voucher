/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { Logger } from '@nestjs/common';

import { AppModule } from './app/app.module';

const logger = new Logger('Main');

const server = express();

export const createNestServer = async expressInstance => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance)
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  if (process.env.GCLOUD_PROJECT) {
    return app.init();
  }
  return app.listen(process.env.port || 3333, '');
};

createNestServer(server)
  .then(() => logger.log('Nest is ready!'))
  .catch(err => logger.error('Nest is broken!', err));

export const api = functions.https.onRequest(server);
