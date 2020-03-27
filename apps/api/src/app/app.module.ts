import { Module } from '@nestjs/common';

import { GqlModule } from './gql/gql.module';

@Module({
  imports: [GqlModule],
})
export class AppModule {}
