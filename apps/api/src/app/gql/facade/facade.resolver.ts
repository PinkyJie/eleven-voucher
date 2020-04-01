import { Resolver, Args, Mutation } from '@nestjs/graphql';

import { FuelType } from '../seven-eleven/fuel/fuel.model';

import { FacadeService } from './facade.service';
import { AccountAndVoucher } from './facade.model';

@Resolver()
export class FacadeResolver {
  constructor(private facadeService: FacadeService) {}

  @Mutation(() => AccountAndVoucher, {
    description: 'Get a voucher directly.',
  })
  async genAccountAndLockInVoucher(
    @Args('fuelType') fuelType: string
  ): Promise<AccountAndVoucher> {
    return this.facadeService.genAccountAndLockInVoucher(fuelType as FuelType);
  }
}
