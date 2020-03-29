import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
  private url = 'https://projectzerothree.info/api.php?format=json';

  async getFuelPrices(): Promise<Fuel> {
    const response = await axios.get(this.url);
    const { regions, updated } = response.data as FuelResponse;
    const allRegion = regions.find(region => region.region === 'All');
    return allRegion.prices.reduce(
      (result, price) => {
        result[price.type] = price;
        return result;
      },
      {
        updated,
      } as Fuel
    );
  }
}
