import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { GqlModule } from './gql/gql.module';

@Module({
  imports: [
    GqlModule,
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
  ],
})
export class AppModule {}
