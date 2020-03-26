import { Resolver, Args, Query } from '@nestjs/graphql';
import { EmailMessage, EmailMessageWithBody } from './email.model';
import { EmailService } from './email.service';

@Resolver(() => EmailMessage)
export class EmailResolver {
  constructor(private emailService: EmailService) {}

  @Query(() => [EmailMessage], {
    name: 'emailMessages',
    description: 'Retrieve messages for a specific email address.',
  })
  async getEmailMessages(
    @Args('email') email: string
  ): Promise<EmailMessage[]> {
    return this.emailService.getEmailMessages(email);
  }

  @Query(() => EmailMessage, {
    name: 'emailMessage',
    description: 'Retrieve a message with a specific message ID.',
  })
  async getEmailMessage(
    @Args('email') email: string,
    @Args('id') id: number
  ): Promise<EmailMessageWithBody> {
    return this.emailService.getEmailMessage(email, id);
  }
}
