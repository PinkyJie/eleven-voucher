import { Resolver, Args, Mutation } from '@nestjs/graphql';

import { FacadeService } from './facade.service';
import { AccountAndVoucher } from './facade.model';
import { GetMeAVoucherInput, RefreshVoucherInput } from './facade.dto';

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

  @Mutation(() => AccountAndVoucher, {
    description: 'Refresh the voucher with email/password.',
  })
  async refreshVoucher(
    @Args('refreshVoucherInput') refreshVoucherInput: RefreshVoucherInput
  ): Promise<AccountAndVoucher> {
    const { email, password, voucherId } = refreshVoucherInput;
    const refreshedVoucher = await this.facadeService.refreshVoucherWithEmailAndPassword(
      email,
      password,
      voucherId
    );
    return {
      account: {
        email,
        password,
      },
      voucher: refreshedVoucher,
    };
  }
}
