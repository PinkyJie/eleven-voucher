import { Injectable, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

import { FuelType } from '../fuel/fuel.model';
import { GqlContext } from '../../gql.context';
import { ApiService } from '../../../api/api.service';
import { WINSTON_LOGGER, Logger } from '../../../logger/winston-logger';

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
  private loggerInfo = {
    emitter: 'VoucherService',
  };

  constructor(
    @Inject(CONTEXT) private readonly ctx: GqlContext,
    @Inject(WINSTON_LOGGER) private logger: Logger,
    private apiService: ApiService
  ) {}

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
    this.logger.debug('Get vouchers:', {
      ...this.loggerInfo,
      meta: {
        deviceSecretToken,
      },
    });
    const response = await this.apiService.elevenRequest({
      url: 'FuelLock/List',
      method: 'GET',
      deviceSecretToken,
      accessToken,
      deviceId: this.ctx.deviceId,
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
    this.logger.debug('Start lock in:', {
      ...this.loggerInfo,
      meta: {
        fuelType,
        deviceSecretToken,
      },
    });
    const startLockInResponse = await this.apiService.elevenRequest({
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
    // HTTP 409 means the email already has a voucher attached
    if (startLockInResponse.status === 200) {
      this.logger.debug('Confirm lock in:', {
        ...this.loggerInfo,
        meta: {
          fuelType,
          deviceSecretToken,
        },
      });
      const confirmLockInResponse = await this.apiService.elevenRequest({
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

      if (confirmLockInResponse.status === 201) {
        return this.transformVoucherResponse(
          confirmLockInResponse.data as VoucherResponse
        );
      }
    }
    return null;
  }

  async getRefreshedVoucher(
    voucherId: string,
    deviceSecretToken: string,
    accessToken: string
  ): Promise<Voucher> {
    this.logger.debug(`Refresh voucher: ${voucherId}`, {
      ...this.loggerInfo,
      meta: {
        voucherId,
        deviceSecretToken,
      },
    });
    const response = await this.apiService.elevenRequest({
      url: `FuelLock/Refresh?fuelLockId=${voucherId}`,
      method: 'GET',
      deviceSecretToken,
      accessToken,
      deviceId: this.ctx.deviceId,
    });

    return this.transformVoucherResponse(response.data as VoucherResponse);
  }
}
