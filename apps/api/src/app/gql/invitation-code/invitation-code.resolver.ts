import { Resolver, Mutation } from '@nestjs/graphql';

import { PublicAccess } from '../auth/auth.decorator';

import { InvitationCodeService } from './invitation-code.service';

@Resolver()
export class InvitationCodeResolver {
  constructor(private invitationCodeService: InvitationCodeService) {}

  @PublicAccess()
  @Mutation(() => Boolean, {
    description: 'Process the invitation form and send invitation email.',
  })
  async processInvitationForm(): Promise<boolean> {
    return this.invitationCodeService.processInvitationForm();
  }
}
