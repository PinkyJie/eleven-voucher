import { Injectable, Inject } from '@nestjs/common';

import { ApiService } from '../../../api/api.service';
import { WINSTON_LOGGER, Logger } from '../../../logger/winston-logger';

import { Fuel, FuelPrice } from './fuel.model';

interface RegionResponse {
  prices: FuelPrice[];
  region:
    | 'All'
    | 'VIC'
    | 'NSW'
    | 'QLD'
    | 'WA'
    | 'All-2'
    | 'VIC-2'
    | 'NSW-2'
    | 'QLD-2'
    | 'WA-2'
    | 'All-3'
    | 'VIC-3'
    | 'NSW-3'
    | 'QLD-3'
    | 'WA-3';
}

interface FuelResponse {
  regions: RegionResponse[];
  updated: number;
}

@Injectable()
export class FuelService {
  private loggerInfo = {
    emitter: 'FuelService',
  };
  private url = 'https://projectzerothree.info/api.php?format=json';

  constructor(
    @Inject(WINSTON_LOGGER) private logger: Logger,
    private apiService: ApiService
  ) {}

  async getFuelPrices(): Promise<Fuel> {
    this.logger.debug('Fetch all fuel prices', {
      ...this.loggerInfo,
    });
    const response = await this.apiService.request({
      url: this.url,
      method: 'GET',
    });
    const { regions, updated } = response.data as FuelResponse;
    const allRegion = regions.find(region => region.region === 'All');
    const fuelPrices = allRegion.prices.reduce((result, price) => {
      result[price.type] = price;
      return result;
    }, {} as Fuel);

    return {
      ...fuelPrices,
      updated,
    };
  }
}
