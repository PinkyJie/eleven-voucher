import { Module } from '@nestjs/common';

import { GqlModule } from './gql/gql.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [GqlModule, DbModule],
})
export class AppModule {}
