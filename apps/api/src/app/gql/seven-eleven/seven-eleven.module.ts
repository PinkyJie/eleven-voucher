import { Module } from '@nestjs/common';

import { AccountModule } from './account/account.module';
import { FuelModule } from './fuel/fuel.module';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [AccountModule, FuelModule, VoucherModule],
})
export class SevenElevenModule {}
