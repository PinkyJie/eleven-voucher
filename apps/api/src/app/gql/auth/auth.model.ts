import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SessionUser {
  @Field({ description: 'UID for the user' })
  uid: string;

  @Field({ description: 'Email address for the user' })
  email: string;

  @Field({ description: 'Role for the user' })
  role?: string;
}
