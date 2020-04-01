import { Injectable, Inject, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { CONTEXT } from '@nestjs/graphql';

import { request } from '../utils/request';
import { DEVICE_NAME, ANDROID_VERSION } from '../utils/constant';
import { GqlContext } from '../../gql.context';

import { Account } from './account.model';

const logger = new Logger('AccountService');

interface LoginOrVerifyResponse {
  DeviceSecretToken: string;
  AccountId: string;
  FirstName: string;
  Email: string;
}

@Injectable()
export class AccountService {
  constructor(@Inject(CONTEXT) private readonly ctx: GqlContext) {}

  private transformLoginOrVerifyResponse(
    response: AxiosResponse<LoginOrVerifyResponse>
  ): Account {
    const { DeviceSecretToken, AccountId, FirstName, Email } = response.data;
    return {
      id: AccountId,
      firstName: FirstName,
      email: Email,
      deviceSecretToken: DeviceSecretToken,
      accessToken: response.headers['x-accesstoken'],
    };
  }

  async login(email: string, password: string): Promise<Account> {
    logger.log(`Login with: ${email}`);
    const response = await request({
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
    logger.log(response.data);

    return this.transformLoginOrVerifyResponse(response);
  }

  async logout(
    deviceSecretToken: string,
    accessToken: string
  ): Promise<boolean> {
    logger.log('Logout:');
    const response = await request({
      url: 'account/logout',
      method: 'POST',
      deviceSecretToken,
      accessToken,
      deviceId: this.ctx.deviceId,
    });

    logger.log(response.data);

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
    logger.log(`Register new account:`);
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
    logger.log(data);
    logger.log(`Device ID: ${this.ctx.deviceId}`);
    const response = await request({
      url: 'account/register',
      method: 'POST',
      data,
      deviceId: this.ctx.deviceId,
    });
    logger.log(response.data);

    return response.data === '';
  }

  async verify(verificationCode: string): Promise<Account> {
    logger.log(`Verify with: ${verificationCode}`);
    const response = await request({
      url: 'account/verify',
      method: 'POST',
      data: {
        VerificationCode: verificationCode,
        DeviceName: DEVICE_NAME,
        DeviceOsNameVersion: ANDROID_VERSION,
      },
      deviceId: this.ctx.deviceId,
    });

    logger.log(response.data);

    return this.transformLoginOrVerifyResponse(response);
  }
}
