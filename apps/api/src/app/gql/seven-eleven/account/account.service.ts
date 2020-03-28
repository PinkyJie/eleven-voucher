import { Injectable } from '@nestjs/common';

import { request } from '../utils/request';
import { DEVICE_NAME, ANDROID_VERSION } from '../utils/constant';

import { Account } from './account.model';

interface LoginResponse {
  DeviceSecretToken: string;
  AccountId: string;
  FirstName: string;
  Email: string;
}

@Injectable()
export class AccountService {
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

    const {
      DeviceSecretToken,
      AccountId,
      FirstName,
      Email,
    } = response.data as LoginResponse;
    return {
      id: AccountId,
      firstName: FirstName,
      email: Email,
      deviceSecretToken: DeviceSecretToken,
      accessToken: response.headers['x-accesstoken'],
    };
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
}
