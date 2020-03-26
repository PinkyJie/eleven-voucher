import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field({ description: 'Email address' })
  email: string;

  @Field({ description: 'Password' })
  password: string;
}

@InputType()
export class LogoutInput {
  @Field({ description: 'Device secret token' })
  deviceSecretToken: string;

  @Field({ description: 'Access token' })
  accessToken: string;
}

@InputType()
export class RegisterAccountInput {
  @Field({ description: 'Email address' })
  email: string;

  @Field({ description: 'Password' })
  password: string;

  @Field({ description: 'First name' })
  firstName: string;

  @Field({ description: 'Last name' })
  lastName: string;

  @Field({ description: 'Mobile phone number' })
  phone: string;

  @Field({ description: 'Date of birth' })
  dobTimestamp: string;
}
