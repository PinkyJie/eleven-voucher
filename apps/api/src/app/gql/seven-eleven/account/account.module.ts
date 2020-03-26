import { Module } from '@nestjs/common';
import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';

@Module({
  providers: [AccountResolver, AccountService],
})
export class AccountModule {}
