import { Injectable, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { AxiosResponse } from 'axios';

import { ApiService } from '../../../api/api.service';
import { WINSTON_LOGGER, Logger } from '../../../logger/winston-logger';
import { DEVICE_NAME, ANDROID_VERSION } from '../../../utils/constant';
import { GqlContext } from '../../gql.context';

import { Account } from './account.model';

interface LoginOrVerifyResponse {
  DeviceSecretToken: string;
  AccountId: string;
  FirstName: string;
  Email: string;
}

@Injectable()
export class AccountService {
  private loggerInfo = {
    emitter: 'AccountService',
  };

  constructor(
    @Inject(CONTEXT) private readonly ctx: GqlContext,
    @Inject(WINSTON_LOGGER) private logger: Logger,
    private apiService: ApiService
  ) {}

  private transformLoginOrVerifyResponse(
    response: AxiosResponse<LoginOrVerifyResponse>,
    /**
     * DON'T trust the email returned by login/verify API, should
     * always pass email field here explicity.
     *
     * Because API response will change from uppercase to lowercase,
     * which is still valid for login purpose, but cause we use email
     * as key in DB, it will trigger error when looking up the changed
     * case email in DB.
     */
    email: string
  ): Account {
    const { DeviceSecretToken, AccountId, FirstName } = response.data;
    return {
      id: AccountId,
      firstName: FirstName,
      email,
      deviceSecretToken: DeviceSecretToken,
      accessToken: response.headers['x-accesstoken'],
    };
  }

  async login(email: string, password: string): Promise<Account> {
    this.logger.debug(`Login with: ${email}`, {
      ...this.loggerInfo,
    });
    const response = await this.apiService.elevenRequest({
      url: 'account/login',
      method: 'POST',
      data: {
        Email: email,
        Password: password,
        DeviceName: DEVICE_NAME,
        DeviceOsNameVersion: ANDROID_VERSION,
      },
      deviceId: this.ctx.deviceId,
    });

    return this.transformLoginOrVerifyResponse(response, email);
  }

  async logout(
    deviceSecretToken: string,
    accessToken: string
  ): Promise<boolean> {
    this.logger.debug('Logout', {
      ...this.loggerInfo,
      meta: {
        deviceSecretToken,
      },
    });
    const response = await this.apiService.elevenRequest({
      url: 'account/logout',
      method: 'POST',
      deviceSecretToken,
      accessToken,
      deviceId: this.ctx.deviceId,
    });

    return response.data === '';
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    dobTimestamp: string
  ): Promise<boolean> {
    const data = {
      EmailAddress: email,
      FirstName: firstName,
      Surname: lastName,
      Password: password,
      PhoneNumber: phone,
      DobSinceEpoch: dobTimestamp,
      OptInForPromotions: false,
      OptInForSms: false,
    };
    this.logger.debug('Register new account', {
      ...this.loggerInfo,
      meta: {
        data,
        deviceId: this.ctx.deviceId,
      },
    });
    const response = await this.apiService.elevenRequest({
      url: 'account/register',
      method: 'POST',
      data,
      deviceId: this.ctx.deviceId,
    });

    return response.data === '';
  }

  async verify(verificationCode: string, email: string): Promise<Account> {
    this.logger.debug(`Verify with: ${verificationCode}`, {
      ...this.loggerInfo,
    });
    const response = await this.apiService.elevenRequest({
      url: 'account/verify',
      method: 'POST',
      data: {
        VerificationCode: verificationCode,
        DeviceName: DEVICE_NAME,
        DeviceOsNameVersion: ANDROID_VERSION,
      },
      deviceId: this.ctx.deviceId,
    });

    return this.transformLoginOrVerifyResponse(response, email);
  }
}
