import crypto from 'crypto';

import { v4 as uuidv4 } from 'uuid';
import { Method } from 'axios';

import { VARIABLE } from './constant';

export function getDeviceId() {
  const availableCharacters = '0123456789abcdef';
  const len = 16;
  const idArray = [];
  for (let i = 0; i < len; i++) {
    const randomIdx = Math.floor(Math.random() * len);
    idArray.push(availableCharacters[randomIdx]);
  }
  return idArray.join('');
}

function getEncryptionKey() {
  const a = [
    103,
    180,
    267,
    204,
    390,
    504,
    497,
    784,
    1035,
    520,
    1155,
    648,
    988,
    1456,
    1785,
  ];
  const b = [
    50,
    114,
    327,
    276,
    525,
    522,
    371,
    904,
    1017,
    810,
    858,
    852,
    1274,
    1148,
    915,
  ];
  const c = [
    74,
    220,
    249,
    416,
    430,
    726,
    840,
    568,
    1017,
    700,
    1155,
    912,
    1118,
    1372,
  ];

  const length = a.length + b.length + c.length;
  const keyArray = [];

  for (let i = 0; i < length; i++) {
    if (i % 3 === 0) {
      keyArray.push(
        String.fromCharCode(Math.floor(a[Math.floor(i / 3)] / (i / 3 + 1)))
      );
    }
    if (i % 3 === 1) {
      keyArray.push(
        String.fromCharCode(
          Math.floor(b[Math.floor((i - 1) / 3)] / ((i - 1) / 3 + 1))
        )
      );
    }
    if (i % 3 === 2) {
      keyArray.push(
        String.fromCharCode(
          Math.floor(c[Math.floor((i - 1) / 3)] / ((i - 2) / 3 + 1))
        )
      );
    }
  }
  return keyArray.join('');
}

function base64Encode(plainStr) {
  return Buffer.from(plainStr).toString('base64');
}

function md5(plainStr: string) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(Buffer.from(plainStr, 'utf8'));
  return md5sum.digest();
}

function hmacSHA256(base64EncodedKey: string, plainStr: string) {
  const key = Buffer.from(base64EncodedKey, 'base64');
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(plainStr);
  return Buffer.from(hmac.digest()).toString('base64');
}

export function generateTssa(
  url: string,
  method: Method,
  payload?: string,
  accessToken?: string
) {
  // Replace the https URL with a http one and convert the URL to lowercase
  const convertedUrl = url.replace('https', 'http').toLowerCase();
  // Get a timestamp and a UUID
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const uuid = uuidv4();
  // Join the variables into 1 string
  let joinedStr = `${VARIABLE}${method}${convertedUrl}${timestamp}${uuid}`;
  // If we have a payload to encrypt, then we encrypt it and add it to str3
  if (payload) {
    const payloadStr = JSON.stringify(payload);
    const encryptedPayload = base64Encode(md5(payloadStr));
    joinedStr += encryptedPayload;
  }

  const signature = hmacSHA256(getEncryptionKey(), joinedStr);

  // Finish building the tssa string
  let tssa = `tssa ${VARIABLE}:${signature}:${uuid}:${timestamp}`;
  // If we have an access token append it to the tssa string
  if (accessToken) {
    tssa += `:${accessToken}`;
  }

  return tssa;
}
