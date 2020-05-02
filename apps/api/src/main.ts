import { Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

import { AppModule } from './app/app.module';
import { FirebaseAuthGuard } from './app/gql/auth/auth.guard';
import { RolesGuard } from './app/gql/auth/roles.guard';
import { environment } from './environments/environment';

require('dotenv').config();

const logger = new Logger('Main');

const server = express();

server.get('/', (req, res) => res.send('ok'));

const port = environment.port;

export const createNestServer = async expressInstance => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance)
  );
  app.enableCors({
    origin: environment.corsWhitelist,
  });

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new FirebaseAuthGuard(reflector));
  app.useGlobalGuards(new RolesGuard(reflector));

  return app.listen(port, '');
};

createNestServer(server)
  .then(() => logger.log(`Nest is running on ${port}!`))
  .catch(err => logger.error('Nest is broken!', err));
