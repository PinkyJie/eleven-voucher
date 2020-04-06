import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { Logger } from '@nestjs/common';

import { AppModule } from './app/app.module';

const logger = new Logger('Main');

const server = express();

server.get('/', (req, res) => res.send('ok'));

const port = process.env.PORT || 3333;

export const createNestServer = async expressInstance => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance)
  );
  app.enableCors();

  return app.listen(port, '');
};

createNestServer(server)
  .then(() => logger.log(`Nest is running on ${port}!`))
  .catch(err => logger.error('Nest is broken!', err));
