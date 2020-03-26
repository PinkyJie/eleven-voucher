import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Account {
  @Field({ description: 'Account ID' })
  id: string;

  @Field({ description: 'First name' })
  firstName: string;

  @Field({ description: 'Email' })
  email: string;

  @Field({ description: 'Device secret token' })
  deviceSecretToken: string;

  @Field({ description: 'Access token' })
  accessToken: string;
}
