import { generateTssa } from './encrypt';
import {
  BASE_URL,
  HOST,
  ANDROID_VERSION,
  DEVICE_ID,
  APP_VERSION,
} from './constant';

import axios, { Method } from 'axios';

export async function request(options: {
  url: string;
  method: Method;
  data?: any;
  deviceSecretToken?: string;
  accessToken?: string;
}) {
  const { url, method, data = '', deviceSecretToken, accessToken } = options;
  const tssa = generateTssa(`${BASE_URL}${url}`, method, data, accessToken);

  const headers = {
    'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)',
    Connection: 'Keep-Alive',
    Host: HOST,
    Authorization: tssa,
    'X-OsVersion': ANDROID_VERSION,
    'X-OsName': 'Android',
    'X-DeviceID': DEVICE_ID,
    'X-AppVersion': APP_VERSION,
    'Content-Type': 'application/json; charset=utf-8',
    ...(deviceSecretToken && {
      'X-DeviceSecret': deviceSecretToken,
    }),
  };

  return axios({
    method,
    headers,
    data,
    url: `${BASE_URL}${url}`,
  });
}
