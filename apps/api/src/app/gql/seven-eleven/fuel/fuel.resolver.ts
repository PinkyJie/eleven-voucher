import { Resolver, Query } from '@nestjs/graphql';

import { Fuel } from './fuel.model';
import { FuelService } from './fuel.service';

@Resolver(() => Fuel)
export class FuelResolver {
  constructor(private fuelService: FuelService) {}

  @Query(() => Fuel, {
    name: 'fuel',
    description: 'Retrieve best fuel price for all types.',
  })
  async getFuel(): Promise<Fuel> {
    return this.fuelService.getFuelPrices();
  }
}
