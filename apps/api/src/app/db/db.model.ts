import { FuelType } from '../gql/seven-eleven/fuel/fuel.model';
import { Voucher } from '../gql/seven-eleven/voucher/voucher.model';

export class DbUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  fuelType: FuelType;
}

export class DbFuelPrice {
  fuelType: FuelType;
  price: number;
  state: string;
  store: string;
  suburb: string;
  postCode: string;
  updatedTime: number;
}

export class DbVoucher extends Voucher {
  email: string;
}
