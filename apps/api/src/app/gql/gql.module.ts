import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { SevenElevenModule } from './seven-eleven/seven-eleven.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    EmailModule,
    SevenElevenModule,
    GraphQLModule.forRoot({
      playground: true,
      ...(process.env.GCLOUD_PROJECT
        ? {
            // firebase deployment doesn't support file generation
            autoSchemaFile: true,
          }
        : { autoSchemaFile: 'schema.gql' }),
    }),
  ],
})
export class GqlModule {}
