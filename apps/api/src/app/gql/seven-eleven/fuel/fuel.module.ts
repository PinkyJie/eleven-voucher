import { Module } from '@nestjs/common';

import { FuelResolver } from './fuel.resolver';
import { FuelService } from './fuel.service';

@Module({
  providers: [FuelResolver, FuelService],
})
export class FuelModule {}
