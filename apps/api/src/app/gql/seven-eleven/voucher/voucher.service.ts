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
  private transformVoucherResponse(voucherResponse: VoucherResponse): Voucher {
    return {
      id: voucherResponse.Id,
      status: voucherResponse.Status,
      code: voucherResponse.CouponCode,
      fuelType: fuelTypes.find(
        type => type.value === voucherResponse.FuelGradeModel
      ).label,
      fuelPrice: voucherResponse.CentsPerLitre,
      liters: voucherResponse.TotalLitres,
      storeId: voucherResponse.StoreId,
      createdAt: voucherResponse.CreatedAt,
      expiredAt: voucherResponse.ExpiresAt,
    };
  }

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
    return vouchers.map(this.transformVoucherResponse);
  }

  async lockInVoucher(
    accountId: string,
    fuelType: FuelType,
    liters: number,
    deviceLatitude: number,
    deviceLongitude: number,
    deviceSecretToken: string,
    accessToken: string
  ): Promise<Voucher> {
    const startLockInResponse = await request({
      url: 'FuelLock/StartSession',
      method: 'POST',
      data: {
        LastStoreUpdateTimestamp: Math.floor(new Date().getTime() / 1000),
        Latitude: String(deviceLatitude),
        Longitude: String(deviceLongitude),
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
        return this.transformVoucherResponse(
          confirmLockInResponse.data as VoucherResponse
        );
      }
    }
    return null;
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
