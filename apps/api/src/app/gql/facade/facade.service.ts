import { Injectable, Logger } from '@nestjs/common';
import faker from 'faker';
import { format } from 'date-fns';

import { EmailService } from '../email/email.service';
import { AccountService } from '../seven-eleven/account/account.service';
import { FuelService } from '../seven-eleven/fuel/fuel.service';
import { VoucherService } from '../seven-eleven/voucher/voucher.service';
import { FuelPrice, FuelType } from '../seven-eleven/fuel/fuel.model';
import { Account } from '../seven-eleven/account/account.model';
import { DbService } from '../../db/db.service';
import { Voucher } from '../seven-eleven/voucher/voucher.model';
// import { DbVoucher } from '../../db/db.model';

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
    const registerData = {
      email,
      password,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: getPhoneNumber(),
      dob: faker.date.between(new Date(1980, 1, 1), new Date(1995, 1, 1)),
    };

    const registerResponse = await this.accountService.register(
      registerData.email,
      registerData.password,
      registerData.firstName,
      registerData.lastName,
      registerData.phone,
      Math.floor(registerData.dob.getTime() / 1000).toString()
    );

    if (registerResponse === false) {
      throw new Error('Registration fail');
    }

    return registerData;
  }

  private async verifyAccount(
    email: string,
    maxAttempts = 10
  ): Promise<Account> {
    logger.log(`Verify max attempts: ${maxAttempts}`);
    const verificationCode = await multipleAttempts<string>(
      () => this.emailService.findVerificationCodeInEmail(email),
      {
        isResolveValueValid: result => !!result,
        attempt: maxAttempts,
        interval: 2000,
      }
    );

    if (!verificationCode) {
      throw new Error('Get verification code fail');
    }

    logger.log('Start verifying:');
    const verifyResponse = await this.accountService.verify(verificationCode);
    logger.log(`Account id: ${verifyResponse.id}`);
    return verifyResponse;
  }

  private async lockInWithAccount(
    account: Account,
    fuelType: FuelType,
    location: {
      lat: number;
      lng: number;
    }
  ): Promise<Voucher> {
    const voucher = await this.voucherService.lockInVoucher(
      account.id,
      fuelType,
      150,
      location.lat,
      location.lng,
      account.deviceSecretToken,
      account.accessToken
    );
    if (!voucher) {
      throw new Error('Lock in fail');
    }
    logger.log(`Voucher code: ${voucher.code}`);

    await this.accountService.logout(
      account.deviceSecretToken,
      account.accessToken
    );

    return voucher;
  }

  async genAccountAndLockInVoucher(
    fuelType: FuelType
  ): Promise<AccountAndVoucher> {
    // 1. get best fuel price
    logger.log('1. Get fuel price');
    const fuelPrices = await this.fuelService.getFuelPrices();
    const { price, lat, lng } = fuelPrices[fuelType] as FuelPrice;
    logger.log(`Fuel type: ${fuelType}`);
    logger.log(`Price: ${price}`);
    logger.log(`Latitude: ${lat}`);
    logger.log(`Longitude: ${lng}`);

    // 2. register a new account
    logger.log('2. Account registration');
    const registerData = await this.registerAccount();
    logger.log(`Email: ${registerData.email}`);
    logger.log(`Password: ${registerData.password}`);

    // 3. verify account
    logger.log('3. Verify account');
    const account = await this.verifyAccount(registerData.email);

    await this.dbService.addNewUser({
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      phone: registerData.phone,
      dob: format(registerData.dob, 'yyyy-MM-dd'),
      fuelType,
    });

    // 4. lock in
    logger.log('4. Lock in voucher');
    const voucher = await this.lockInWithAccount(account, fuelType, {
      lat,
      lng,
    });

    await this.dbService.addNewVoucher({
      ...voucher,
      email: registerData.email,
    });

    return {
      account: {
        email: registerData.email,
        password: registerData.password,
      },
      voucher,
    };
  }

  private async refreshVoucher(
    voucherDoc: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData
    >
  ): Promise<boolean> {
    const dbVoucher = voucherDoc.data();
    const voucherId = dbVoucher.id;
    const voucherStatus = dbVoucher.status;
    logger.log(`Refresh voucher: ${voucherId}`);
    logger.log(`Existing status: ${voucherStatus}`);
    const email = dbVoucher.email;
    // get account
    logger.log(`Get account info for: ${email}`);
    const userSnapshot = await this.dbService.getUserByEmail(email);
    const password = userSnapshot.docs[0].get('password');
    // login account
    logger.log(`Start login: ${email}`);
    const { deviceSecretToken, accessToken } = await this.accountService.login(
      email,
      password
    );
    // refresh voucher
    const refreshedVoucher = await this.voucherService.getRefreshedVoucher(
      voucherId,
      deviceSecretToken,
      accessToken
    );
    logger.log(`New status: ${refreshedVoucher.status}`);
    const needUpdate = refreshedVoucher.status !== voucherStatus;
    if (needUpdate) {
      logger.log(`Update status to: ${refreshedVoucher.status}`);
      await voucherDoc.ref.set({ status: refreshedVoucher });
    } else {
      logger.log('No status update required');
    }
    // logout account
    logger.log(`Start logout: ${email}`);
    await this.accountService.logout(deviceSecretToken, accessToken);
    return needUpdate;
  }

  private async getValidVoucherCount(
    fuelType: FuelType,
    price: number,
    limit: number
  ): Promise<number> {
    const vouchersSnapshot = await this.dbService.getValidVouchersByFuelType(
      fuelType,
      price,
      limit
    );
    const validVouchers = vouchersSnapshot.docs.filter(async voucherDoc => {
      return await this.refreshVoucher(voucherDoc);
    });
    return validVouchers.length;
  }

  async refreshAllFuelPrices(): Promise<boolean> {
    const { updated, ...fuelPrices } = await this.fuelService.getFuelPrices();

    Object.keys(fuelPrices).forEach(async (fuelType: FuelType) => {
      const fuelPriceSnapshot = await this.dbService.getLatestFuelPriceRecord(
        fuelType
      );
      const shouldUpdate =
        fuelPriceSnapshot.docs.length === 0 ||
        fuelPriceSnapshot.docs[0].get('updatedTime') < updated;

      if (!shouldUpdate) {
        logger.log(`${fuelType}: no need to update to DB`);
      } else {
        logger.log(`${fuelType}: new price found`);
        const fuelPrice = fuelPrices[fuelType];
        await this.dbService.addNewFuelPrice({
          fuelType,
          price: fuelPrice.price,
          state: fuelPrice.state,
          store: fuelPrice.name,
          suburb: fuelPrice.suburb,
          postCode: fuelPrice.postcode,
          updatedTime: updated,
        });
        // logger.log(`Check if we need to lock more voucher:`);
        // const requiredVoucherCount = 5;
        // const validVoucherCount = await this.getValidVoucherCount(
        //   fuelType,
        //   fuelPrice.price,
        //   requiredVoucherCount
        // );
        // logger.log(
        //   `Valid vouchers for: ${fuelType} - ${validVoucherCount}/${requiredVoucherCount}`
        // );
        // const moreVoucherRequired = requiredVoucherCount - validVoucherCount;
      }
    });
    return true;
  }
}
