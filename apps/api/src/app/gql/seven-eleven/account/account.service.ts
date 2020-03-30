import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { request } from '../utils/request';
import { DEVICE_NAME, ANDROID_VERSION } from '../utils/constant';

import { Account } from './account.model';

interface LoginOrVerifyResponse {
  DeviceSecretToken: string;
  AccountId: string;
  FirstName: string;
  Email: string;
}

@Injectable()
export class AccountService {
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
    const response = await request({
      url: 'account/login',
      method: 'POST',
      data: {
        Email: email,
        Password: password,
        DeviceName: DEVICE_NAME,
        DeviceOsNameVersion: ANDROID_VERSION,
      },
    });

    return this.transformLoginOrVerifyResponse(response);
  }

  async logout(
    deviceSecretToken: string,
    accessToken: string
  ): Promise<boolean> {
    const response = await request({
      url: 'account/logout',
      method: 'POST',
      deviceSecretToken,
      accessToken,
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
    const response = await request({
      url: 'account/register',
      method: 'POST',
      data: {
        EmailAddress: email,
        FirstName: firstName,
        Surname: lastName,
        Password: password,
        PhoneNumber: phone,
        DobSinceEpoch: dobTimestamp,
        OptInForPromotions: false,
        OptInForSms: false,
      },
    });

    return response.data === '';
  }

  async verify(verificationCode: string): Promise<Account> {
    const response = await request({
      url: 'account/verify',
      method: 'POST',
      data: {
        VerificationCode: verificationCode,
        DeviceName: DEVICE_NAME,
        DeviceOsNameVersion: ANDROID_VERSION,
      },
    });

    return this.transformLoginOrVerifyResponse(response);
  }
}
