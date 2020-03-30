import { Field, ArgsType, InputType } from '@nestjs/graphql';

import { FuelType } from '../fuel/fuel.model';

@ArgsType()
export class GetVouchersArgs {
  @Field({ description: 'Device secret token' })
  deviceSecretToken: string;

  @Field({ description: 'Access token' })
  accessToken: string;
}

@InputType()
export class LockInInput {
  @Field({ description: 'Account ID' })
  accountId: string;

  @Field(() => FuelType, { description: 'Fuel type' })
  fuelType: FuelType;

  @Field({ description: 'Liters', defaultValue: 150, nullable: true })
  liters?: number;

  @Field({ description: 'The latitude of the device location' })
  deviceLatitude: number;

  @Field({ description: 'The longitude of the device location' })
  deviceLongitude: number;

  @Field({ description: 'Device secret token' })
  deviceSecretToken: string;

  @Field({ description: 'Access token' })
  accessToken: string;
}
