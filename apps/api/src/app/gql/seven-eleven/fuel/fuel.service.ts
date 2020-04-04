import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { Fuel, FuelPrice } from './fuel.model';

const logger = new Logger('FuelService');

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
  private url = 'https://projectzerothree.info/api.php?format=json';

  async getFuelPrices(): Promise<Fuel> {
    logger.log('Fetch all fuel prices');
    const response = await axios.get(this.url);
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
