import { Module } from '@nestjs/common';

import { ApiModule } from './api/api.module';
import { GqlModule } from './gql/gql.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [GqlModule, LoggerModule, ApiModule],
})
export class AppModule {}
