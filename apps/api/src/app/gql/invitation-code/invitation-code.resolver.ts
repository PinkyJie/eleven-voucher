import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { Role } from '../../utils/constant';
import { Roles } from '../auth/auth.decorator';

import { SendInvitationEmailsInput } from './invitation-code.dto';
import { InvitationCodeService } from './invitation-code.service';

@Resolver()
export class InvitationCodeResolver {
  constructor(private invitationCodeService: InvitationCodeService) {}

  @Roles(Role.Admin)
  @Mutation(() => Boolean, {
    description:
      'Process the invitation form submitted by "lastHours" and send invitation email.',
  })
  async processInvitationForm(
    @Args('lastHours') lastHours: number
  ): Promise<boolean> {
    await this.invitationCodeService.processInvitationForm(lastHours);
    return true;
  }

  @Roles(Role.Admin)
  @Mutation(() => Boolean, {
    description: 'Send invitation code to multiple emails.',
  })
  async sendInvitationEmails(
    @Args('sendInvitationEmailsInput')
    sendInvitationEmailsInput: SendInvitationEmailsInput
  ): Promise<boolean> {
    await this.invitationCodeService.sendInvitationEmails(
      sendInvitationEmailsInput.emails
    );
    return true;
  }
}
