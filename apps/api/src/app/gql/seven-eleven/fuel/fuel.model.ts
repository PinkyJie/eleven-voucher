import {
  Field,
  ObjectType,
  Float,
  registerEnumType,
  Int,
} from '@nestjs/graphql';

export enum FuelType {
  E10 = 'E10',
  U91 = 'U91',
  U95 = 'U95',
  U98 = 'U98',
  Diesel = 'Diesel',
  LPG = 'LPG',
}

registerEnumType(FuelType, {
  name: 'FuelType',
});

@ObjectType()
export class FuelPrice {
  @Field(() => FuelType, { description: 'Fuel type' })
  type: FuelType;

  @Field(() => Float, { description: 'Fuel price' })
  price: number;

  @Field({ description: 'The suburb for the store' })
  suburb: string;

  @Field({ description: 'The post code for the store' })
  postcode: string;

  @Field({ description: 'The state for the store' })
  state: string;

  @Field({ description: 'The name of the store' })
  name: string;

  @Field(() => Float, {
    description: 'Longitude of the store which has this price',
  })
  lng: number;

  @Field(() => Float, {
    description: 'Latitude of the store which has this price',
  })
  lat: number;
}

@ObjectType()
export class Fuel {
  @Field({ description: 'Best fuel price of E10' })
  E10: FuelPrice;

  @Field({ description: 'Best fuel price of U91' })
  U91: FuelPrice;

  @Field({ description: 'Best fuel price of U95' })
  U95: FuelPrice;

  @Field({ description: 'Best fuel price of U98' })
  U98: FuelPrice;

  @Field({ description: 'Best fuel price of Diesel' })
  Diesel: FuelPrice;

  @Field({ description: 'Best fuel price of LPG' })
  LPG: FuelPrice;

  @Field(() => Int, { description: 'Last updated timestamp' })
  updated: number;
}
