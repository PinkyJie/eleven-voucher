import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';

import { PublicAccess } from '../auth/auth.decorator';

import { GetMeAVoucherInput, RefreshVoucherInput } from './facade.dto';
import { AccountAndVoucher } from './facade.model';
import { FacadeService } from './facade.service';

@Resolver()
export class FacadeResolver {
  constructor(private facadeService: FacadeService) {}

  @PublicAccess()
  @Query(() => String, { description: 'Health check' })
  healthCheck(): string {
    return 'OK';
  }

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

  @PublicAccess()
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
