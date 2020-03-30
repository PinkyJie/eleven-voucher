import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { AccountModule } from '../seven-eleven/account/account.module';
import { FuelModule } from '../seven-eleven/fuel/fuel.module';
import { VoucherModule } from '../seven-eleven/voucher/voucher.module';

import { FacadeResolver } from './facade.resolver';
import { FacadeService } from './facade.service';

@Module({
  imports: [EmailModule, AccountModule, FuelModule, VoucherModule],
  providers: [FacadeResolver, FacadeService],
})
export class FacadeModule {}
