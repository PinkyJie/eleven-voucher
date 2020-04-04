import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';

import { FuelType } from '../gql/seven-eleven/fuel/fuel.model';

import { DbUser, DbFuelPrice, DbVoucher } from './db.model';

const logger = new Logger('DbService');

@Injectable()
export class DbService {
  db: FirebaseFirestore.Firestore;

  constructor() {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    this.db = admin.firestore();
  }

  private getServerTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  async addNewUser(user: DbUser) {
    const userRef = this.db.collection('users');
    logger.log('Add new user to DB:');
    logger.log(user);
    await userRef.add({ ...user, timestamp: this.getServerTimestamp() });
  }

  async getLatestFuelPriceRecord(fuelType: FuelType) {
    const fuelPriceRef = this.db.collection('fuel_prices');
    return fuelPriceRef
      .where('fuelType', '==', fuelType)
      .orderBy('updatedTime', 'desc')
      .limit(1)
      .get();
  }

  async addNewFuelPrice(fuelPrice: DbFuelPrice) {
    const fuelPriceRef = this.db.collection('fuel_prices');
    logger.log('Add new fuel price to DB:');
    logger.log(fuelPrice);
    await fuelPriceRef.add({
      ...fuelPrice,
      timestamp: this.getServerTimestamp(),
    });
  }

  async addNewVoucher(voucher: DbVoucher) {
    const voucherRef = this.db.collection('vouchers');
    logger.log('Add new voucher to DB:');
    logger.log(voucher);
    await voucherRef.add({ ...voucher, timestamp: this.getServerTimestamp() });
  }

  async getUserByEmail(email: string) {
    const userRef = this.db.collection('users');
    return userRef
      .where('email', '==', email)
      .limit(1)
      .get();
  }

  async getValidVouchersByFuelType(
    fuelType: FuelType,
    price: number,
    limit: number
  ) {
    const voucherRef = this.db.collection('vouchers');
    const now = Math.floor(new Date().getTime() / 1000);
    return voucherRef
      .where('fuelType', '==', fuelType)
      .where('status', '==', 0)
      .where('price', '<=', price)
      .where('expireAt', '>', now)
      .orderBy('createdAt')
      .limit(limit)
      .get();
  }
}
