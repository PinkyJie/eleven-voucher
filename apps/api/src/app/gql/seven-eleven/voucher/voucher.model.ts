import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

import { FuelType } from '../fuel/fuel.model';

export enum VoucherStatus {
  Active = 0,
  Expired = 1,
  Redeemed = 2,
}

@ObjectType()
export class Voucher {
  @Field({ description: 'Voucher ID' })
  id: string;

  @Field(() => Int, {
    description: 'Voucher status: 0: Active, 1: Expired, 2: Redeemed',
  })
  status: VoucherStatus;

  @Field({ description: 'The voucher code' })
  code: string;

  @Field(() => FuelType, { description: 'The fuel type for the voucher' })
  fuelType: FuelType;

  @Field(() => Float, { description: 'The fuel price for the voucher' })
  fuelPrice: number;

  @Field(() => Int, {
    description: 'The maximum liters available for the voucher',
  })
  liters: number;

  @Field({
    description: 'The store id which this voucher belongs to',
  })
  storeId: string;

  @Field(() => Int, {
    description: 'The creation timestamp for the voucher',
  })
  createdAt: number;

  @Field(() => Int, {
    description: 'The expiration timestamp for the voucher',
  })
  expiredAt: number;
}
