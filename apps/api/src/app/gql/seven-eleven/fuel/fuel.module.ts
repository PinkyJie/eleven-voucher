import { Module } from '@nestjs/common';

import { DbModule } from '../../../db/db.module';

import { FuelResolver } from './fuel.resolver';
import { FuelService } from './fuel.service';

@Module({
  imports: [DbModule],
  providers: [FuelResolver, FuelService],
  exports: [FuelService],
})
export class FuelModule {}
