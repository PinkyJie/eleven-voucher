import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { Logger } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const logger = new Logger('Main');

const server = express();

server.get('/', (req, res) => res.send('ok'));

export const createNestServer = async expressInstance => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance)
  );
  app.enableCors();

  return app.listen(environment.port, '');
};

createNestServer(server)
  .then(() => logger.log(`Nest is running on ${environment.port}!`))
  .catch(err => logger.error('Nest is broken!', err));
