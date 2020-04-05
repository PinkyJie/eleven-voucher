import { Module } from '@nestjs/common';

import { GqlModule } from './gql/gql.module';
import { LoggerModule } from './logger/logger.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [GqlModule, LoggerModule, ApiModule],
})
export class AppModule {}
