import { InputType, Field, Float } from '@nestjs/graphql';

import { FuelType } from '../seven-eleven/fuel/fuel.model';

@InputType()
export class GetMeAVoucherInput {
  @Field(() => FuelType, { description: 'Fuel type' })
  fuelType: FuelType;

  @Field(() => Float, { description: 'Fuel price' })
  fuelPrice: number;

  @Field(() => Float, { description: 'Latitude for the location' })
  latitude: number;

  @Field(() => Float, { description: 'Longitude for the location' })
  longitude: number;
}
