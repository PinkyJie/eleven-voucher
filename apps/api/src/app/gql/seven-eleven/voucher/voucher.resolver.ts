import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';

import { LockInInput } from './voucher.dto';
import { Voucher } from './voucher.model';
import { VoucherService } from './voucher.service';

@Resolver()
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

  @Query(() => Voucher, {
    name: 'refreshedVoucher',
    description: 'Retrieve the refreshed voucher.',
  })
  async getRefreshedVoucher(
    @Args('voucherId') voucherId: string,
    @Args('deviceSecretToken') deviceSecretToken: string,
    @Args('accessToken') accessToken: string
  ): Promise<Voucher> {
    return this.voucherService.getRefreshedVoucher(
      voucherId,
      deviceSecretToken,
      accessToken
    );
  }

  @Mutation(() => Voucher, {
    name: '',
    description: 'Lock in the fuel price voucher.',
    nullable: true,
  })
  async lockInVoucher(
    @Args('lockInInput') lockInInput: LockInInput
  ): Promise<Voucher> {
    return this.voucherService.lockInVoucher(
      lockInInput.accountId,
      lockInInput.fuelType,
      lockInInput.liters,
      lockInInput.deviceLatitude,
      lockInInput.deviceLongitude,
      lockInInput.deviceSecretToken,
      lockInInput.accessToken
    );
  }
}
