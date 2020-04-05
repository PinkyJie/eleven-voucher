import { Module, Global } from '@nestjs/common';

import { WINSTON_LOGGER, winstonLogger } from './winston-logger';

@Global()
@Module({
  providers: [
    {
      provide: WINSTON_LOGGER,
      useValue: winstonLogger,
    },
  ],
  exports: [WINSTON_LOGGER],
})
export class LoggerModule {}
