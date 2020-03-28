import { Injectable } from '@nestjs/common';

import { request } from '../utils/request';
import { FuelType } from '../fuel/fuel.model';

import { Voucher } from './voucher.model';

const fuelTypes = [
  {
    label: FuelType.U91,
    value: 52,
  },
  {
    label: FuelType.Diesel,
    value: 53,
  },
  {
    label: FuelType.LPG,
    value: 54,
  },
  {
    label: FuelType.U95,
    value: 55,
  },
  {
    label: FuelType.U98,
    value: 56,
  },
  {
    label: FuelType.E10,
    value: 57,
  },
];

interface VoucherResponse {
  Id: string;
  Status: number;
  CouponCode: string;
  FuelGradeModel: number;
  CentsPerLitre: number;
  TotalLitres: number;
  StoreId: string;
  ExpiresAt: number;
  CreatedAt: number;
}

interface LastUsedVoucherResponse {
  RewardAmount: number;
  CentsPerLitre: number;
  RewardLitres: number;
}

@Injectable()
export class VoucherService {
  async getVouchers(
    deviceSecretToken: string,
    accessToken: string
  ): Promise<Voucher[]> {
    const response = await request({
      url: 'FuelLock/List',
      method: 'GET',
      deviceSecretToken,
      accessToken,
    });

    const vouchers = response.data as VoucherResponse[];
    return vouchers.map(voucher => ({
      id: voucher.Id,
      status: voucher.Status,
      code: voucher.CouponCode,
      fuelType: fuelTypes.find(type => type.value === voucher.FuelGradeModel)
        .label,
      fuelPrice: voucher.CentsPerLitre,
      liters: voucher.TotalLitres,
      storeId: voucher.StoreId,
      createdAt: voucher.CreatedAt,
      expiredAt: voucher.ExpiresAt,
    }));
  }

  async lockInVoucher(
    accountId: string,
    fuelType: FuelType,
    liters: number,
    storeLatitude: number,
    storeLongitude: number,
    deviceSecretToken: string,
    accessToken: string
  ): Promise<boolean> {
    const startLockInResponse = await request({
      url: 'FuelLock/StartSession',
      method: 'POST',
      data: {
        LastStoreUpdateTimestamp: Math.floor(new Date().getTime() / 1000),
        Latitude: String(storeLatitude),
        Longitude: String(storeLongitude),
      },
      deviceSecretToken,
      accessToken,
    });
    if (startLockInResponse.status === 200) {
      const confirmLockInResponse = await request({
        url: 'FuelLock/Confirm',
        method: 'POST',
        data: {
          AccountId: accountId,
          FuelType: String(
            fuelTypes.find(type => type.label === fuelType).value
          ),
          NumberOfLitres: String(liters),
        },
        deviceSecretToken,
        accessToken,
      });

      if (confirmLockInResponse.status === 201) {
        // successful lock in will return VoucherResponse
        return true;
      }
    }
    return false;
  }

  async getLastRedeemedVoucher(
    voucherId: string,
    deviceSecretToken: string,
    accessToken: string
  ): Promise<boolean> {
    const response = await request({
      url: `FuelLock/Refresh?fuelLockId=${voucherId}`,
      method: 'GET',
      deviceSecretToken,
      accessToken,
    });
    console.log(response.data);
    return true;
  }
}
