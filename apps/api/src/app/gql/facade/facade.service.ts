import { Injectable } from '@nestjs/common';
import faker from 'faker';

import { EmailService } from '../email/email.service';
import { AccountService } from '../seven-eleven/account/account.service';
import { FuelService } from '../seven-eleven/fuel/fuel.service';
import { VoucherService } from '../seven-eleven/voucher/voucher.service';
import { FuelPrice, FuelType } from '../seven-eleven/fuel/fuel.model';

import { AccountAndVoucher } from './facade.model';

async function sleep(milliSeconds: number) {
  const promise = new Promise(resolve => {
    setTimeout(() => resolve, milliSeconds);
  });
  return promise;
}

@Injectable()
export class FacadeService {
  constructor(
    private emailService: EmailService,
    private accountService: AccountService,
    private fuelService: FuelService,
    private voucherService: VoucherService
  ) {}

  async genAccountAndLockInVoucher(
    fuelType: FuelType
  ): Promise<AccountAndVoucher> {
    const email = `${faker.internet.userName()}@1secmail.com`;
    const password = faker.internet.password();
    // 1. register a new account
    const registerResponse = await this.accountService.register(
      email,
      password,
      faker.name.firstName(),
      faker.name.lastName(),
      '0491570156',
      Math.floor(
        faker.date
          .between(new Date(1980, 1, 1), new Date(1995, 1, 1))
          .getTime() / 1000
      ).toString()
    );
    if (registerResponse === false) {
      throw new Error('Registration fail');
    }

    // 2. get best fuel price
    const fuelPriceResponse = await this.fuelService.getFuelPrices();
    const { lat, lng } = fuelPriceResponse[fuelType] as FuelPrice;

    // 3. get verification code from email
    // wait email to be arrived
    let maxAttempt = 5;
    let verificationCode = '';
    while (maxAttempt--) {
      verificationCode = await this.emailService.findVerificationCodeInEmail(
        email
      );
      if (verificationCode) {
        break;
      }
      await sleep(500);
    }

    if (!verificationCode) {
      throw new Error('Email verification fail');
    }

    // 4. verify account
    const verifyResponse = await this.accountService.verify(verificationCode);

    // 5. lock in the price
    const lockInResponse = await this.voucherService.lockInVoucher(
      verifyResponse.id,
      fuelType,
      150,
      lat,
      lng,
      verifyResponse.deviceSecretToken,
      verifyResponse.accessToken
    );
    if (!lockInResponse) {
      throw new Error('Lock in fail');
    }
    return {
      account: {
        email,
        password,
      },
      voucher: lockInResponse,
    };
  }
}
