import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { InvitationCodeService } from './invitation-code.service';

@Resolver()
export class InvitationCodeResolver {
  constructor(private invitationCodeService: InvitationCodeService) {}

  @Mutation(() => Boolean, {
    description:
      'Process the invitation form submitted by "lastHours" and send invitation email.',
  })
  async processInvitationForm(
    @Args('lastHours') lastHours: number
  ): Promise<boolean> {
    return this.invitationCodeService.processInvitationForm(lastHours);
  }
}
