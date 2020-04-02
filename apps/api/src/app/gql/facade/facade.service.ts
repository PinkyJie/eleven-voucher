import { Injectable, Logger } from '@nestjs/common';
import faker from 'faker';
import { format } from 'date-fns';

import { EmailService } from '../email/email.service';
import { AccountService } from '../seven-eleven/account/account.service';
import { FuelService } from '../seven-eleven/fuel/fuel.service';
import { VoucherService } from '../seven-eleven/voucher/voucher.service';
import { FuelPrice, FuelType } from '../seven-eleven/fuel/fuel.model';
import { DbService } from '../../db/db.service';

import { AccountAndVoucher } from './facade.model';

const logger = new Logger('FacadeService');

function multipleAttempts<T>(
  promiseGenerator: () => Promise<T>,
  config: {
    isResolveValueValid: (result: T) => boolean;
    attempt: number;
    interval: number;
  }
): Promise<T> {
  const { isResolveValueValid, attempt, interval } = config;
  logger.log(`Current attempt: ${attempt}`);
  return new Promise(resolve => {
    promiseGenerator().then(result => {
      logger.log(`Result: ${result}`);
      if (isResolveValueValid(result)) {
        resolve(result);
      } else {
        const attemptsLeft = attempt - 1;
        if (attemptsLeft === 0) {
          resolve();
        } else {
          setTimeout(() => {
            multipleAttempts<T>(promiseGenerator, {
              isResolveValueValid,
              interval,
              attempt: attemptsLeft,
            }).then(resolve);
          }, interval);
        }
      }
    });
  });
}

function getPhoneNumber() {
  const phoneNumber = faker.phone.phoneNumberFormat();
  const phoneArr = phoneNumber.replace(/ /g, '').split('');
  phoneArr.splice(1, 1, '4');
  return phoneArr.join('');
}

@Injectable()
export class FacadeService {
  constructor(
    private emailService: EmailService,
    private accountService: AccountService,
    private fuelService: FuelService,
    private voucherService: VoucherService,
    private dbService: DbService
  ) {}

  private async registerAccount() {
    const availableEmail = ['@1secmail.net', '@1secmail.com', '@1secmail.org'];
    const randomIdx = Math.floor(Math.random() * 3);

    faker.locale = 'en_AU';
    const email = `${faker.internet.userName()}${availableEmail[randomIdx]}`;
    const password = faker.internet.password();
    const accountData = {
      email,
      password,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: getPhoneNumber(),
      dob: faker.date.between(new Date(1980, 1, 1), new Date(1995, 1, 1)),
    };

    const registerResponse = await this.accountService.register(
      accountData.email,
      accountData.password,
      accountData.firstName,
      accountData.lastName,
      accountData.phone,
      Math.floor(accountData.dob.getTime() / 1000).toString()
    );

    if (registerResponse === false) {
      throw new Error('Registration fail');
    }

    return accountData;
  }

  async genAccountAndLockInVoucher(
    fuelType: FuelType
  ): Promise<AccountAndVoucher> {
    // 1. register a new account
    logger.log('1. Account registration');
    const accountData = await this.registerAccount();
    logger.log(`Email: ${accountData.email}`);
    logger.log(`Password: ${accountData.password}`);

    // 2. get best fuel price
    logger.log('2. Get fuel price');
    const fuelPrices = await this.fuelService.getFuelPrices();
    const { price, lat, lng } = fuelPrices[fuelType] as FuelPrice;
    logger.log(`Fuel type: ${fuelType}`);
    logger.log(`Price: ${price}`);
    logger.log(`Latitude: ${lat}`);
    logger.log(`Longitude: ${lng}`);

    // 3. get verification code from email
    // wait email to be arrived
    logger.log('3. Get verification code');
    const maxAttempts = 10;
    logger.log(`Max attempts: ${maxAttempts}`);
    const verificationCode = await multipleAttempts<string>(
      () => this.emailService.findVerificationCodeInEmail(accountData.email),
      {
        isResolveValueValid: result => !!result,
        attempt: maxAttempts,
        interval: 2000,
      }
    );

    if (!verificationCode) {
      throw new Error('Get verification code fail');
    }

    // 4. verify account
    logger.log('4. Verify account');
    const verifyResponse = await this.accountService.verify(verificationCode);
    logger.log(`Account id: ${verifyResponse.id}`);

    this.dbService.addNewUser({
      email: accountData.email,
      password: accountData.password,
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      phone: accountData.phone,
      dob: format(accountData.dob, 'yyyy-MM-dd'),
      fuelType,
    });

    // 5. lock in the price
    logger.log('5. Lock in voucher');
    const voucher = await this.voucherService.lockInVoucher(
      verifyResponse.id,
      fuelType,
      150,
      lat,
      lng,
      verifyResponse.deviceSecretToken,
      verifyResponse.accessToken
    );
    if (!voucher) {
      throw new Error('Lock in fail');
    }
    logger.log(`Voucher code: ${voucher.code}`);

    this.dbService.addNewVoucher({
      ...voucher,
      email: accountData.email,
    });

    // 6. logout
    logger.log('6. Logout');
    await this.accountService.logout(
      verifyResponse.deviceSecretToken,
      verifyResponse.accessToken
    );

    return {
      account: {
        email: accountData.email,
        password: accountData.password,
      },
      voucher,
    };
  }

  async refreshAllVouchers(): Promise<boolean> {
    // 1. Get all vouchers
    logger.log('Get all vouchers created within last week: ');
    const vouchersSnapshot = await this.dbService.getVouchersWithinOneWeek();
    // 2. Refresh voucher status
    logger.log('Start refreshing all voucher status:');
    vouchersSnapshot.docs.forEach(async voucher => {
      const voucherId = voucher.get('id');
      const voucherStatus = voucher.get('status');
      logger.log(`Refresh voucher: ${voucherId}`);
      logger.log(`Existing status: ${voucherStatus}`);
      const email = voucher.get('email');
      // get account
      logger.log(`Get account info for: ${email}`);
      const userSnapshot = await this.dbService.getUserByEmail(email);
      const password = userSnapshot.docs[0].get('password');
      // login account
      logger.log(`Start login: ${email}`);
      const {
        deviceSecretToken,
        accessToken,
      } = await this.accountService.login(email, password);
      // refresh voucher
      const refreshedVoucher = await this.voucherService.getRefreshedVoucher(
        voucherId,
        deviceSecretToken,
        accessToken
      );
      logger.log(`New status: ${refreshedVoucher.status}`);
      if (refreshedVoucher.status !== voucherStatus) {
        logger.log(`Update status to: ${refreshedVoucher.status}`);
        await voucher.ref.set({ status: refreshedVoucher });
      } else {
        logger.log('No status update required');
      }
      // logout account
      logger.log(`Start logout: ${email}`);
      await this.accountService.logout(deviceSecretToken, accessToken);
    });
    return true;
  }
}
