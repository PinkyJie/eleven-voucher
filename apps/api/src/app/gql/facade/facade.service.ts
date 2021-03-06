import { Injectable, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { format } from 'date-fns';

import { ApiService } from '../../api/api.service';
import { DbAccount, DbVoucher } from '../../db/db.model';
import { DbService } from '../../db/db.service';
import { WINSTON_LOGGER, Logger } from '../../logger/winston-logger';
import { getDeviceId } from '../../utils/device-id';
import { getFakeAccount } from '../../utils/fake-account';
import { EmailService } from '../email/email.service';
import { GqlContext } from '../gql.context';
import { Account } from '../seven-eleven/account/account.model';
import { AccountService } from '../seven-eleven/account/account.service';
import { FuelType } from '../seven-eleven/fuel/fuel.model';
import { FuelService } from '../seven-eleven/fuel/fuel.service';
import { Voucher, VoucherStatus } from '../seven-eleven/voucher/voucher.model';
import { VoucherService } from '../seven-eleven/voucher/voucher.service';

import { AccountAndVoucher, NewAccount } from './facade.model';

interface KnownUnavailableEmails {
  [email: string]: boolean;
}

@Injectable()
export class FacadeService {
  private loggerInfo = {
    emitter: 'FacadeService',
  };

  constructor(
    private emailService: EmailService,
    private accountService: AccountService,
    private fuelService: FuelService,
    private voucherService: VoucherService,
    private dbService: DbService,
    private apiService: ApiService,
    @Inject(CONTEXT) private readonly ctx: GqlContext,
    @Inject(WINSTON_LOGGER) private logger: Logger
  ) {}

  private switchToNewDeviceId() {
    this.ctx.deviceId = getDeviceId();
    this.logger.debug(`Switch device id to: ${this.ctx.deviceId}`, {
      ...this.loggerInfo,
    });
  }

  private async registerAccount() {
    let registerData = getFakeAccount();
    let accountDoc = await this.dbService.getAccountByEmail(registerData.email);
    while (accountDoc.exists) {
      registerData = getFakeAccount();
      accountDoc = await this.dbService.getAccountByEmail(registerData.email);
    }

    const registerResponse = await this.accountService.register(
      registerData.email,
      registerData.password,
      registerData.firstName,
      registerData.lastName,
      registerData.phone,
      Math.floor(registerData.dob.getTime() / 1000).toString()
    );

    if (registerResponse === false) {
      this.logger.error('Registration fail', {
        ...this.loggerInfo,
        meta: {
          ...registerData,
          deviceId: this.ctx.deviceId,
        },
      });
      throw new Error('Registration fail');
    }

    return registerData;
  }

  private async verifyAccount(
    email: string,
    maxAttempts = 10
  ): Promise<Account> {
    const attemptInterval = 2000;
    this.logger.info(
      `Attempt ${maxAttempts} times (wait ${attemptInterval}s) to verify account`,
      {
        ...this.loggerInfo,
        meta: {
          email,
        },
      }
    );
    const verificationCode = await this.apiService.multiplePromiseAttempts<
      string
    >(() => this.emailService.findVerificationCodeInEmail(email), {
      isResolveValueValid: result => !!result,
      attempt: maxAttempts,
      interval: attemptInterval,
    });

    if (!verificationCode) {
      this.logger.error(`Get verification code fail for ${email}`, {
        ...this.loggerInfo,
      });
      throw new Error('Get verification code fail');
    }

    const verifyResponse = await this.accountService.verify(
      verificationCode,
      email
    );
    return verifyResponse;
  }

  private async lockInWithExistingAccount(
    account: Account,
    fuelType: FuelType,
    lat: number,
    lng: number
  ): Promise<Voucher> {
    const voucher = await this.voucherService.lockInVoucher(
      account.id,
      fuelType,
      150,
      lat,
      lng,
      account.deviceSecretToken,
      account.accessToken
    );
    if (!voucher) {
      this.logger.error(`Lock in fail with ${account.email} for ${fuelType}`, {
        ...this.loggerInfo,
        meta: {
          deviceId: this.ctx.deviceId,
        },
      });
      throw new Error('Lock in fail');
    }

    await this.dbService.addNewVoucher({
      ...voucher,
      email: account.email,
    });

    return voucher;
  }

  private async lockInWithNewAccount(
    fuelType: FuelType,
    lat: number,
    lng: number
  ): Promise<AccountAndVoucher> {
    // register a new account
    this.logger.info(`Account registration for ${fuelType}`, {
      ...this.loggerInfo,
    });
    const registerData = await this.registerAccount();

    // verify account
    this.logger.info('Verify account:', {
      ...this.loggerInfo,
      meta: {
        email: registerData.email,
      },
    });
    const account = await this.verifyAccount(registerData.email);

    await this.dbService.addNewAccount({
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      phone: registerData.phone,
      dob: format(registerData.dob, 'yyyy-MM-dd'),
      fuelType,
    });

    // lock in
    this.logger.info('Lock in voucher:', {
      ...this.loggerInfo,
      meta: {
        email: registerData.email,
        fuelType,
      },
    });
    const voucher = await this.lockInWithExistingAccount(
      account,
      fuelType,
      lat,
      lng
    );

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

  async refreshVoucherWithEmailAndPassword(
    email: string,
    password: string,
    voucherId: string
  ): Promise<Voucher> {
    // login account
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
    this.logger.info(`Voucher refreshed: ${voucherId}`, {
      ...this.loggerInfo,
      meta: {
        email,
        status: refreshedVoucher.status,
        expiredAt: refreshedVoucher.expiredAt,
      },
    });
    const needUpdate = refreshedVoucher.status !== VoucherStatus.Active;
    if (needUpdate) {
      this.logger.info('Update new voucher status to DB', {
        ...this.loggerInfo,
        meta: refreshedVoucher,
      });
      await this.dbService.updateVoucherStatus(
        voucherId,
        refreshedVoucher.status
      );
    } else {
      this.logger.info('No voucher status update required', {
        ...this.loggerInfo,
        meta: {
          voucherId,
        },
      });
    }
    // logout account
    await this.accountService.logout(deviceSecretToken, accessToken);
    return refreshedVoucher;
  }

  private async refreshVoucherWithDbDoc(
    voucherDoc: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData
    >
  ): Promise<{
    account: NewAccount;
    refreshedDbVoucher: DbVoucher;
  }> {
    const dbVoucher = voucherDoc.data() as DbVoucher;
    const voucherId = dbVoucher.id;
    this.logger.info(`Refreshing voucher: ${voucherId}`, {
      ...this.loggerInfo,
      meta: {
        email: dbVoucher.email,
        status: dbVoucher.status,
        expiredAt: dbVoucher.expiredAt,
      },
    });
    const email = dbVoucher.email;
    // get account
    const accountSnapshot = await this.dbService.getAccountByEmail(email);
    const password = accountSnapshot.get('password');
    // refresh voucher
    const refreshedVoucher = await this.refreshVoucherWithEmailAndPassword(
      email,
      password,
      voucherId
    );

    return {
      account: {
        email,
        password,
      },
      refreshedDbVoucher: {
        ...refreshedVoucher,
        email,
      },
    };
  }

  private async getValidVouchersForFuelType(
    fuelType: FuelType,
    price: number,
    limit: number
  ): Promise<DbVoucher[]> {
    const voucherDocs = await this.dbService.getValidVouchersByFuelType(
      fuelType,
      price,
      limit
    );
    this.logger.info(`Found ${voucherDocs.length} vouchers in DB.`, {
      ...this.loggerInfo,
      meta: {
        fuelType,
        price,
      },
    });
    const validVouchers: DbVoucher[] = [];
    // for-of can keep the sequence of await in loop
    // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for (const voucherDoc of voucherDocs) {
      // switch to a new device id for every refresh
      this.switchToNewDeviceId();
      const { refreshedDbVoucher } = await this.refreshVoucherWithDbDoc(
        voucherDoc
      );
      if (refreshedDbVoucher.status === VoucherStatus.Active) {
        validVouchers.push(refreshedDbVoucher);
      }
    }
    this.logger.info(
      `After refresh, only ${validVouchers.length} vouchers are still valid.`,
      {
        ...this.loggerInfo,
        meta: {
          fuelType,
          price,
          vouchers: validVouchers,
        },
      }
    );
    return validVouchers;
  }

  private async findAvailableAccounts(
    fuelType: FuelType,
    blacklist: KnownUnavailableEmails,
    limit: number
  ): Promise<DbAccount[]> {
    const allAccountsForThisFuelSnapshot = await this.dbService.getAccountByFuelType(
      fuelType
    );
    const availableAccounts: DbAccount[] = [];
    const dbAccounts = allAccountsForThisFuelSnapshot.docs
      .filter(accountDoc => !blacklist[accountDoc.get('email')])
      .map(accountDoc => accountDoc.data() as DbAccount);

    this.logger.info(
      `Found ${dbAccounts.length} available accounts to lock ${fuelType}`,
      {
        ...this.loggerInfo,
        meta: {
          accounts: dbAccounts,
        },
      }
    );

    for (const dbAccount of dbAccounts) {
      this.switchToNewDeviceId();
      // check if this account still has active voucher attached
      const account = await this.accountService.login(
        dbAccount.email,
        dbAccount.password
      );
      const vouchers = await this.voucherService.getVouchers(
        account.deviceSecretToken,
        account.accessToken
      );
      this.logger.info(
        `Found ${vouchers.length} vouchers attached to ${dbAccount.email}`,
        {
          ...this.loggerInfo,
          meta: {
            fuelType,
            vouchers,
          },
        }
      );

      // update voucher status in DB if necessary
      for (const voucher of vouchers) {
        await this.dbService.updateVoucherStatus(voucher.id, voucher.status);
      }

      const activeVouchers = vouchers.filter(
        voucher => voucher.status === VoucherStatus.Active
      );
      this.logger.info(
        `${activeVouchers.length} vouchers attached to ${dbAccount.email} are still active`,
        {
          ...this.loggerInfo,
          meta: {
            fuelType,
            vouchers: activeVouchers,
          },
        }
      );
      if (activeVouchers.length === 0) {
        availableAccounts.push(dbAccount);
      }
      // early termination
      if (availableAccounts.length >= limit) {
        break;
      }
    }
    this.logger.info(
      `Found ${availableAccounts.length} available accounts to lock ${fuelType}`,
      {
        ...this.loggerInfo,
        meta: {
          accounts: availableAccounts,
        },
      }
    );
    return availableAccounts;
  }

  private async lockInWithExistingOrNewAccount(
    fuelType: FuelType,
    knownUnavailableEmails: KnownUnavailableEmails,
    lat: number,
    lng: number,
    lockCount: number
  ): Promise<AccountAndVoucher> {
    const availableAccounts = await this.findAvailableAccounts(
      fuelType,
      knownUnavailableEmails,
      lockCount
    );
    const newAccountCount = lockCount - availableAccounts.length;
    let result: AccountAndVoucher;
    // use existing account to lock
    this.logger.info(
      `Use ${availableAccounts.length} existing accounts to lock ${fuelType}.`,
      {
        ...this.loggerInfo,
        meta: {
          accounts: availableAccounts,
        },
      }
    );
    for (const availableAccount of availableAccounts) {
      this.switchToNewDeviceId();
      const account = await this.accountService.login(
        availableAccount.email,
        availableAccount.password
      );
      const voucher = await this.lockInWithExistingAccount(
        account,
        fuelType,
        lat,
        lng
      );
      result = {
        account: {
          email: availableAccount.email,
          password: availableAccount.password,
        },
        voucher,
      };
    }
    this.logger.info(
      `Need to register ${newAccountCount} new accounts to lock ${fuelType}.`,
      {
        ...this.loggerInfo,
        meta: {
          accounts: availableAccounts,
        },
      }
    );
    if (newAccountCount > 0) {
      // create new account to lock in
      const range = [...Array(newAccountCount).keys()];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const i of range) {
        this.switchToNewDeviceId();
        result = await this.lockInWithNewAccount(fuelType, lat, lng);
      }
    }
    if (lockCount === 1) {
      return result;
    }
    return null;
  }

  async refreshAllFuelPrices(): Promise<boolean> {
    const { updated, ...fuelPrices } = await this.fuelService.getFuelPrices();

    const allFuelTypes = Object.keys(fuelPrices) as FuelType[];
    for (const fuelType of allFuelTypes) {
      const fuelPriceSnapshot = await this.dbService.getLatestFuelPriceRecord(
        fuelType
      );
      const shouldUpdate =
        fuelPriceSnapshot.docs.length === 0 ||
        fuelPriceSnapshot.docs[0].get('updatedTime') < updated;

      if (!shouldUpdate) {
        this.logger.info(`${fuelType}: DB has latest price already`, {
          ...this.loggerInfo,
          meta: {
            lastUpdated:
              fuelPriceSnapshot.docs.length > 0
                ? fuelPriceSnapshot.docs[0].get('updatedTime')
                : 'no record in DB',
            newUpdated: updated,
          },
        });
        continue;
      }

      const fuelPrice = fuelPrices[fuelType];
      this.logger.info(`${fuelType}: new update found`, {
        ...this.loggerInfo,
        meta: {
          price: fuelPrice.price,
        },
      });

      this.logger.info(`Check if we need to lock more voucher:`, {
        ...this.loggerInfo,
        meta: {
          fuelType,
        },
      });
      // make sure we have enough vouchers maximum
      const maxVoucherCount = 3;
      const validDbVouchers = await this.getValidVouchersForFuelType(
        fuelType,
        fuelPrice.price,
        maxVoucherCount
      );
      this.logger.info(
        `Valid vouchers for: ${fuelType} - ${validDbVouchers.length}/${maxVoucherCount}`,
        {
          ...this.loggerInfo,
        }
      );
      const needCreateVoucherCount = maxVoucherCount - validDbVouchers.length;
      if (needCreateVoucherCount > 0) {
        const knownUnavailableEmails = validDbVouchers.reduce(
          (result, dbVoucher) => {
            result[dbVoucher.email] = true;
            return result;
          },
          {} as KnownUnavailableEmails
        );
        // Only lock 1 vouchers to prevent potential rate limit
        this.logger.info(`Locking in 1 voucher for ${fuelType}`, {
          ...this.loggerInfo,
        });
        await this.lockInWithExistingOrNewAccount(
          fuelType,
          knownUnavailableEmails,
          fuelPrice.lat,
          fuelPrice.lng,
          1
        );
      }
      // write this new price to DB
      await this.dbService.addNewFuelPrice({
        ...fuelPrice,
        updatedTime: updated,
      });
    }
    return true;
  }

  async getMeAVoucher(
    fuelType: FuelType,
    price: number,
    lat: number,
    lng: number
  ): Promise<AccountAndVoucher> {
    this.logger.info(`Trying to get a voucher for: ${fuelType} - ${price}c/L`, {
      ...this.loggerInfo,
    });
    const voucherDocs = await this.dbService.getValidVouchersByFuelType(
      fuelType,
      price,
      1
    );
    if (voucherDocs.length > 0) {
      this.logger.info(`Found one voucher in DB: ${voucherDocs[0].get('id')}`, {
        ...this.loggerInfo,
        meta: {
          fuelType,
        },
      });
      const {
        account,
        refreshedDbVoucher,
      } = await this.refreshVoucherWithDbDoc(voucherDocs[0]);
      if (refreshedDbVoucher.status === VoucherStatus.Active) {
        const { email, ...voucher } = refreshedDbVoucher;
        this.logger.info(`Voucher ${voucher.id} is valid, return!`, {
          ...this.loggerInfo,
          meta: {
            email,
            voucher,
          },
        });
        return {
          account,
          voucher,
        };
      }
    }
    this.logger.info(
      'No voucher available in DB for this price, lock a new one!',
      {
        ...this.loggerInfo,
        meta: {
          fuelType,
        },
      }
    );
    return this.lockInWithExistingOrNewAccount(fuelType, {}, lat, lng, 1);
  }
}
