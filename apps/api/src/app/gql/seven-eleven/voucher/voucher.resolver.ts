import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';

import { Voucher } from './voucher.model';
import { VoucherService } from './voucher.service';
import { LockInInput } from './voucher.dto';

@Resolver(() => Voucher)
export class VoucherResolver {
  constructor(private voucherService: VoucherService) {}

  @Query(() => [Voucher], {
    name: 'vouchers',
    description: 'Retrieve the voucher list.',
    nullable: 'items',
  })
  async getVouchers(
    @Args('deviceSecretToken') deviceSecretToken: string,
    @Args('accessToken') accessToken: string
  ): Promise<Voucher[]> {
    return this.voucherService.getVouchers(deviceSecretToken, accessToken);
  }

  @Query(() => Boolean, {
    name: 'lastUsedVoucher',
    description: 'Retrieve the voucher list.',
  })
  async getLastUsedVouchers(
    @Args('voucherId') voucherId: string,
    @Args('deviceSecretToken') deviceSecretToken: string,
    @Args('accessToken') accessToken: string
  ): Promise<boolean> {
    return this.voucherService.getLastRedeemedVoucher(
      voucherId,
      deviceSecretToken,
      accessToken
    );
  }

  @Mutation(() => Boolean, {
    name: '',
    description: 'Lock in the fuel price voucher.',
  })
  async lockInVoucher(
    @Args('lockInInput') lockInInput: LockInInput
  ): Promise<boolean> {
    return this.voucherService.lockInVoucher(
      lockInInput.accountId,
      lockInInput.fuelType,
      lockInInput.liters,
      lockInInput.storeLatitude,
      lockInInput.storeLongitude,
      lockInInput.deviceSecretToken,
      lockInInput.accessToken
    );
  }
}
