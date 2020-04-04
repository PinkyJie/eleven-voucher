import { Resolver, Args, Mutation } from '@nestjs/graphql';

import { FacadeService } from './facade.service';
import { AccountAndVoucher } from './facade.model';
import { GetMeAVoucherInput } from './facade.dto';

@Resolver()
export class FacadeResolver {
  constructor(private facadeService: FacadeService) {}

  @Mutation(() => AccountAndVoucher, {
    description: 'Get a voucher directly.',
  })
  async getMeAVoucher(
    @Args('getMeAVoucherInput') getMeAVoucherInput: GetMeAVoucherInput
  ): Promise<AccountAndVoucher> {
    const { fuelType, fuelPrice, latitude, longitude } = getMeAVoucherInput;
    return this.facadeService.getMeAVoucher(
      fuelType,
      fuelPrice,
      latitude,
      longitude
    );
  }

  @Mutation(() => Boolean, {
    description: 'Refresh all fuel prices.',
  })
  async refreshAllFuelPrices(): Promise<boolean> {
    return this.facadeService.refreshAllFuelPrices();
  }
}
