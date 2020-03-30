import { Resolver, Args, Query } from '@nestjs/graphql';

import { EmailMessage, EmailMessageWithBody } from './email.model';
import { EmailService } from './email.service';

@Resolver()
export class EmailResolver {
  constructor(private emailService: EmailService) {}

  @Query(() => [EmailMessage], {
    name: 'emailMessages',
    description: 'Retrieve messages for a specific email address.',
    nullable: 'items',
  })
  async getEmailMessages(
    @Args('email') email: string
  ): Promise<EmailMessage[]> {
    return this.emailService.getEmailMessages(email);
  }

  @Query(() => EmailMessageWithBody, {
    name: 'emailMessage',
    description: 'Retrieve a message with a specific message ID.',
    nullable: true,
  })
  async getEmailMessage(
    @Args('email') email: string,
    @Args('id') id: number
  ): Promise<EmailMessageWithBody> {
    return this.emailService.getEmailMessage(email, id);
  }

  @Query(() => String, {
    description: 'Retrieve the verification code in the email.',
    nullable: true,
  })
  async findVerificationCodeInEmail(
    @Args('email') email: string
  ): Promise<string> {
    return this.emailService.findVerificationCodeInEmail(email);
  }
}
