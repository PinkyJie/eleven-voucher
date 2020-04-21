import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { environment } from '../../environments/environment';
import { getDeviceId } from '../utils/device-id';

import { SevenElevenModule } from './seven-eleven/seven-eleven.module';
import { EmailModule } from './email/email.module';
import { FacadeModule } from './facade/facade.module';
import { GqlContext } from './gql.context';
import { AuthModule } from './auth/auth.module';
import { InvitationCodeModule } from './invitation-code/invitation-code.module';

@Module({
  imports: [
    EmailModule,
    SevenElevenModule,
    FacadeModule,
    AuthModule,
    InvitationCodeModule,
    GraphQLModule.forRoot({
      context: ({ req }): GqlContext => ({
        // get a new device id for every request, otherwise lock in API will return error
        deviceId: getDeviceId(),
        req,
      }),
      playground: true,
      introspection: true,
      ...(environment.readonlyFileSystem
        ? {
            // for read only file system, use in memory file
            autoSchemaFile: true,
          }
        : { autoSchemaFile: 'schema.gql' }),
    }),
  ],
})
export class GqlModule {}
