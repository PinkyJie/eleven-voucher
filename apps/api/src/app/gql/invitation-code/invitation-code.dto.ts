import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SendInvitationEmailsInput {
  @Field(() => [String], { description: 'The email list' })
  emails: string[];
}
