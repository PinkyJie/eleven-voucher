import { Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';

import { InvitationCodeResolver } from './invitation-code.resolver';
import { InvitationCodeService } from './invitation-code.service';

@Module({
  imports: [DbModule],
  providers: [InvitationCodeResolver, InvitationCodeService],
  exports: [InvitationCodeService],
})
export class InvitationCodeModule {}
