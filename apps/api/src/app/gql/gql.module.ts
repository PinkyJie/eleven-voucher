import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { SevenElevenModule } from './seven-eleven/seven-eleven.module';
import { EmailModule } from './email/email.module';
import { FacadeModule } from './facade/facade.module';
import { GqlContext } from './gql.context';

export function getDeviceId() {
  const availableCharacters = '0123456789abcdef';
  const len = 16;
  const idArray = [];
  for (let i = 0; i < len; i++) {
    const randomIdx = Math.floor(Math.random() * len);
    idArray.push(availableCharacters[randomIdx]);
  }
  const deviceId = idArray.join('');
  console.log(`New device ID: ${deviceId}`);
  return deviceId;
}

@Module({
  imports: [
    EmailModule,
    SevenElevenModule,
    FacadeModule,
    GraphQLModule.forRoot({
      context: (): GqlContext => ({
        // get a new device id for every request, otherwise lock in API will return error
        deviceId: getDeviceId(),
      }),
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
