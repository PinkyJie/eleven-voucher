import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { SevenElevenModule } from './seven-eleven/seven-eleven.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    EmailModule,
    SevenElevenModule,
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
  ],
})
export class GqlModule {}
