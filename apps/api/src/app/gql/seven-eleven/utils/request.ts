import axios, { Method } from 'axios';

import { generateTssa } from './encrypt';
import { BASE_URL, HOST, ANDROID_VERSION, APP_VERSION } from './constant';

export async function request(options: {
  url: string;
  method: Method;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  deviceSecretToken?: string;
  accessToken?: string;
  deviceId: string;
}) {
  const {
    url,
    method,
    data = '',
    deviceSecretToken,
    accessToken,
    deviceId,
  } = options;
  const tssa = generateTssa(`${BASE_URL}${url}`, method, data, accessToken);

  const headers = {
    'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)',
    Connection: 'Keep-Alive',
    Host: HOST,
    Authorization: tssa,
    'X-OsVersion': ANDROID_VERSION,
    'X-OsName': 'Android',
    'X-DeviceID': deviceId,
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
