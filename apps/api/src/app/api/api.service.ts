import { Injectable, Inject } from '@nestjs/common';
import axios, { AxiosRequestConfig, Method } from 'axios';

import { WINSTON_LOGGER, Logger } from '../logger/winston-logger';
import { generateTssa } from '../utils/encrypt';
import {
  BASE_URL,
  ANDROID_VERSION,
  HOST,
  APP_VERSION,
} from '../utils/constant';

@Injectable()
export class ApiService {
  private loggerInfo = {
    emitter: 'ApiService',
  };

  constructor(@Inject(WINSTON_LOGGER) private logger: Logger) {
    // log http request/response
    axios.interceptors.request.use(
      config => {
        this.logger.debug(`Start request ${config.url}`, {
          ...this.loggerInfo,
          meta: {
            url: config.url,
            method: config.method,
            body: config.params || config.data,
            headers: config.headers,
          },
        });
        return config;
      },
      error => {
        this.logger.error('Request error', {
          ...this.loggerInfo,
          meta: error.toJSON(),
        });
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      response => {
        this.logger.debug(`Request success ${response.config.url}`, {
          ...this.loggerInfo,
          meta: {
            url: response.config.url,
            method: response.config.method,
            body: response.config.params || response.config.data,
            response: response.data,
          },
        });
        return response;
      },
      error => {
        this.logger.error('Response error', {
          ...this.loggerInfo,
          meta: error.toJSON(),
        });
        return Promise.reject(error);
      }
    );
  }

  async request(config: AxiosRequestConfig) {
    return axios(config);
  }

  /**
   * Credits to freyta/7Eleven-Python https://github.com/freyta/7Eleven-Python,
   * this is just a node.js re-implementation.
   */
  async elevenRequest(options: {
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

    return this.request({
      method,
      headers,
      data,
      url: `${BASE_URL}${url}`,
    });
  }

  async multiplePromiseAttempts<T>(
    promiseGenerator: () => Promise<T>,
    config: {
      isResolveValueValid: (result: T) => boolean;
      attempt: number;
      interval: number;
    }
  ): Promise<T> {
    const { isResolveValueValid, attempt, interval } = config;
    this.logger.debug(`Current attempt: ${attempt}`, {
      ...this.loggerInfo,
    });
    return new Promise(resolve => {
      promiseGenerator().then(result => {
        if (isResolveValueValid(result)) {
          this.logger.debug(`Attempts finish: success`, {
            ...this.loggerInfo,
          });
          resolve(result);
        } else {
          const attemptsLeft = attempt - 1;
          if (attemptsLeft === 0) {
            this.logger.debug(`Attempts finish: fail`, {
              ...this.loggerInfo,
            });
            resolve();
          } else {
            setTimeout(() => {
              this.multiplePromiseAttempts<T>(promiseGenerator, {
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
}
