import { Injectable, Inject } from '@nestjs/common';
import { format } from 'date-fns';
import { CONTEXT } from '@nestjs/graphql';

import { EmailService } from '../email/email.service';
import { AccountService } from '../seven-eleven/account/account.service';
import { FuelService } from '../seven-eleven/fuel/fuel.service';
import { VoucherService } from '../seven-eleven/voucher/voucher.service';
import { FuelType } from '../seven-eleven/fuel/fuel.model';
import { Account } from '../seven-eleven/account/account.model';
import { DbService } from '../../db/db.service';
import { Voucher } from '../seven-eleven/voucher/voucher.model';
import { DbUser, DbVoucher } from '../../db/db.model';
import { getDeviceId } from '../../utils/device-id';
import { GqlContext } from '../gql.context';
import { WINSTON_LOGGER, Logger } from '../../logger/winston-logger';
import { getFakeUser } from '../../utils/fake-user';
import { ApiService } from '../../api/api.service';

import { AccountAndVoucher } from './facade.model';

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
    const registerData = getFakeUser();
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

    const verifyResponse = await this.accountService.verify(verificationCode);
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

    return voucher;
  }

  private async lockInWithNewAccount(
    fuelType: FuelType,
    lat: number,
    lng: number
  ): Promise<AccountAndVoucher> {
    // register a new account
    this.logger.info('Account registration', {
      ...this.loggerInfo,
      meta: {
        fuelType,
      },
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

    await this.dbService.addNewUser({
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
        email: account.email,
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

  private async refreshVoucher(
    voucherDoc: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData
    >
  ): Promise<DbVoucher> {
    const dbVoucher = voucherDoc.data() as DbVoucher;
    const voucherId = dbVoucher.id;
    const voucherStatus = dbVoucher.status;
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
    const userSnapshot = await this.dbService.getUserByEmail(email);
    const password = userSnapshot.docs[0].get('password');
    // login account
    // before every login, switch to a new device id
    this.switchToNewDeviceId();
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
        email: dbVoucher.email,
        status: refreshedVoucher.status,
        expiredAt: refreshedVoucher.expiredAt,
      },
    });
    const needUpdate = refreshedVoucher.status !== voucherStatus;
    if (needUpdate) {
      this.logger.info('Update new voucher status to DB', {
        ...this.loggerInfo,
        meta: refreshedVoucher,
      });
      await voucherDoc.ref.set({ status: refreshedVoucher.status });
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
    return {
      ...refreshedVoucher,
      email,
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
      const refreshedDbVoucher = await this.refreshVoucher(voucherDoc);
      if (refreshedDbVoucher.status === 0) {
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

  private async findAvailableUsers(
    fuelType: FuelType,
    blacklist: KnownUnavailableEmails,
    limit: number
  ): Promise<DbUser[]> {
    const allUsersForThisFuelSnapshot = await this.dbService.getUserByFuelType(
      fuelType
    );
    const availableUsers: DbUser[] = [];
    const dbUsers = allUsersForThisFuelSnapshot.docs
      .filter(userDoc => !blacklist[userDoc.get('email')])
      .map(userDoc => userDoc.data() as DbUser);

    this.logger.info(
      `Found ${dbUsers.length} available users to lock ${fuelType}`,
      {
        ...this.loggerInfo,
        meta: {
          users: dbUsers,
        },
      }
    );

    for (const dbUser of dbUsers) {
      // check if this user still has active voucher attached
      const voucherSnapshot = await this.dbService.getVouchersByEmail(
        dbUser.email
      );
      this.logger.info(
        `Found ${voucherSnapshot.docs.length} vouchers attached to ${dbUser.email}`,
        {
          ...this.loggerInfo,
          meta: {
            fuelType,
            vouchers: voucherSnapshot.docs.map(doc => doc.data()),
          },
        }
      );
      const activeVouchers = [];
      for (const voucherDoc of voucherSnapshot.docs) {
        const refreshedDbVoucher = await this.refreshVoucher(voucherDoc);
        if (refreshedDbVoucher.status === 0) {
          activeVouchers.push(voucherDoc);
        }
      }
      this.logger.info(
        `After refresh, ${activeVouchers.length} vouchers attached to ${dbUser.email} are still active`,
        {
          ...this.loggerInfo,
          meta: {
            fuelType,
            vouchers: activeVouchers.map(doc => doc.data()),
          },
        }
      );
      if (activeVouchers.length === 0) {
        availableUsers.push(dbUser);
      }
      // early termination
      if (availableUsers.length >= limit) {
        break;
      }
    }
    this.logger.info(
      `Only ${availableUsers.length} user are available to lock ${fuelType}`,
      {
        ...this.loggerInfo,
        meta: {
          users: availableUsers,
        },
      }
    );
    return availableUsers;
  }

  async lockInWithExistingOrNewUser(
    fuelType: FuelType,
    knownUnavailableEmails: KnownUnavailableEmails,
    lat: number,
    lng: number,
    lockCount: number
  ): Promise<AccountAndVoucher> {
    const availableUsers = await this.findAvailableUsers(
      fuelType,
      knownUnavailableEmails,
      lockCount
    );
    const newUserCount = lockCount - availableUsers.length;
    let result: AccountAndVoucher;
    // use existing user to lock
    this.logger.info(
      `Use ${availableUsers.length} existing users to lock ${fuelType}.`,
      {
        ...this.loggerInfo,
        meta: {
          users: availableUsers,
        },
      }
    );
    for (const user of availableUsers) {
      this.switchToNewDeviceId();
      const account = await this.accountService.login(
        user.email,
        user.password
      );
      const voucher = await this.lockInWithExistingAccount(
        account,
        fuelType,
        lat,
        lng
      );
      result = {
        account: {
          email: user.email,
          password: user.password,
        },
        voucher,
      };
    }
    this.logger.info(
      `Need to register ${newUserCount} new users to loc ${fuelType}.`,
      {
        ...this.loggerInfo,
        meta: {
          users: availableUsers,
        },
      }
    );
    if (newUserCount > 0) {
      // create new user to lock in
      const range = new Array(newUserCount).map((_, idx) => idx);
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
        this.logger.info(`${fuelType}: no need to update to DB`, {
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
      // make sure we have 5 vouchers maximum
      const maxVoucherCount = 5;
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
        /**
         * Only lock 1 vouchers to prevent potential rate limit (HTTP 412)
         */
        this.logger.info(`Locking in 1 voucher for ${fuelType}`, {
          ...this.loggerInfo,
        });
        await this.lockInWithExistingOrNewUser(
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
      const refreshedDbVoucher = await this.refreshVoucher(voucherDocs[0]);
      if (refreshedDbVoucher.status === 0) {
        const userSnapshot = await this.dbService.getUserByEmail(
          voucherDocs[0].get('email')
        );
        const user = userSnapshot.docs[0].data() as DbUser;
        const { email, ...voucher } = refreshedDbVoucher;
        this.logger.info(`Voucher ${voucher.id} is valid, return!`, {
          ...this.loggerInfo,
          meta: {
            email,
            voucher,
          },
        });
        return {
          account: {
            email,
            password: user.password,
          },
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
    return this.lockInWithExistingOrNewUser(fuelType, {}, lat, lng, 1);
  }
}
