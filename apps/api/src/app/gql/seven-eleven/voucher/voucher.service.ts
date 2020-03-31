import { Injectable, Inject, Logger } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

import { request } from '../utils/request';
import { FuelType } from '../fuel/fuel.model';
import { GqlContext } from '../../gql.context';

import { Voucher } from './voucher.model';

const logger = new Logger('VoucherService');

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
  constructor(@Inject(CONTEXT) private readonly ctx: GqlContext) {}

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
      deviceId: this.ctx.deviceId,
    });
    logger.log('Get vouchers:');
    logger.log(response.data);

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
      deviceId: this.ctx.deviceId,
    });
    logger.log('Start lock in:');
    logger.log(startLockInResponse.data);
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
        deviceId: this.ctx.deviceId,
      });
      logger.log('Confirm lock in:');
      logger.log(confirmLockInResponse.data);

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
      deviceId: this.ctx.deviceId,
    });
    logger.log(`Get Last redeemed voucher: ${voucherId}`);
    logger.log(response.data);

    return true;
  }
}
