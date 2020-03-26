import { Module } from '@nestjs/common';

import { AccountModule } from './account/account.module';
import { FuelModule } from './fuel/fuel.module';

@Module({
  imports: [AccountModule, FuelModule],
})
export class SevenElevenModule {}
