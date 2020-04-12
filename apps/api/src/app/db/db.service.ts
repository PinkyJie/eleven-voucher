import { Injectable, Inject } from '@nestjs/common';
import admin from 'firebase-admin';

import { FuelType } from '../gql/seven-eleven/fuel/fuel.model';
import { WINSTON_LOGGER, Logger } from '../logger/winston-logger';
import { VoucherStatus } from '../gql/seven-eleven/voucher/voucher.model';

import { DbUser, DbFuelPrice, DbVoucher } from './db.model';

@Injectable()
export class DbService {
  private loggerInfo = {
    emitter: 'DbService',
  };
  private db: FirebaseFirestore.Firestore;

  constructor(@Inject(WINSTON_LOGGER) private logger: Logger) {
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
    this.logger.debug('Add new user to DB', {
      ...this.loggerInfo,
      meta: {
        user,
      },
    });
    await userRef
      .doc(user.email)
      .set({ ...user, timestamp: this.getServerTimestamp() });
  }

  async getLatestFuelPriceRecord(fuelType: FuelType) {
    const fuelPriceRef = this.db.collection('fuel_prices');
    const result = await fuelPriceRef
      .where('type', '==', fuelType)
      .orderBy('updatedTime', 'desc')
      .limit(1)
      .get();
    this.logger.debug(`Query last updated fuel price for ${fuelType} from DB`, {
      ...this.loggerInfo,
      meta: {
        db: result.docs.map(doc => doc.data()),
      },
    });
    return result;
  }

  async addNewFuelPrice(fuelPrice: DbFuelPrice) {
    const fuelPriceRef = this.db.collection('fuel_prices');
    this.logger.debug('Add new fuel price to DB', {
      ...this.loggerInfo,
      meta: {
        fuelPrice,
      },
    });
    await fuelPriceRef.add({
      ...fuelPrice,
      timestamp: this.getServerTimestamp(),
    });
  }

  async addNewVoucher(voucher: DbVoucher) {
    const voucherRef = this.db.collection('vouchers');
    this.logger.debug('Add new voucher to DB', {
      ...this.loggerInfo,
      meta: {
        voucher,
      },
    });
    await voucherRef
      .doc(voucher.id)
      .set({ ...voucher, timestamp: this.getServerTimestamp() });
  }

  async getUserByEmail(email: string) {
    const userRef = this.db.collection('users');
    const result = await userRef.doc(email).get();
    this.logger.debug(`Query the user record for email ${email} from DB`, {
      ...this.loggerInfo,
      meta: { db: result.data() },
    });
    return result;
  }

  async getUserByFuelType(fuelType: FuelType) {
    const userRef = this.db.collection('users');
    const result = await userRef.where('fuelType', '==', fuelType).get();
    this.logger.debug(`Query all user records for fuel ${fuelType}`, {
      ...this.loggerInfo,
      meta: { db: result.docs.map(doc => doc.data()) },
    });
    return result;
  }

  async getVouchersByEmail(email: string) {
    const voucherRef = this.db.collection('vouchers');
    const now = Math.floor(new Date().getTime() / 1000);
    const result = await voucherRef
      .where('email', '==', email)
      .where('status', '==', VoucherStatus.Active)
      .where('expiredAt', '>', now)
      .get();
    this.logger.debug(`Query all vouchers attached to email ${email} from DB`, {
      ...this.loggerInfo,
      meta: { db: result.docs.map(doc => doc.data()) },
    });
    return result;
  }

  async getValidVouchersByFuelType(
    fuelType: FuelType,
    price: number,
    limit: number
  ) {
    const voucherRef = this.db.collection('vouchers');
    const now = Math.floor(new Date().getTime() / 1000);
    const voucherSnapshot = await voucherRef
      .where('fuelType', '==', fuelType)
      .where('status', '==', VoucherStatus.Active)
      .where('expiredAt', '>', now)
      .orderBy('expiredAt')
      .get();
    const result = voucherSnapshot.docs
      .filter(voucherDoc => voucherDoc.get('fuelPrice') <= price)
      .slice(0, limit);
    this.logger.debug(
      `Query all valid vouchers for fuel ${fuelType} - ${price}c/L from DB`,
      {
        ...this.loggerInfo,
        meta: { db: result.map(doc => doc.data()) },
      }
    );
    return result;
  }

  async updateVoucherStatus(voucherId: string, newStatus: VoucherStatus) {
    const voucherRef = this.db.collection('vouchers');
    const voucherDoc = await voucherRef.doc(voucherId).get();
    if (voucherDoc.exists) {
      await voucherDoc.ref.set({ status: newStatus }, { merge: true });
      this.logger.debug(`Update voucher ${voucherId} status to ${newStatus}`, {
        ...this.loggerInfo,
        meta: {
          voucherId,
          newStatus,
        },
      });
    } else {
      this.logger.debug(
        `Ignore status update of voucher ${voucherId} because it is not existed in DB`,
        {
          ...this.loggerInfo,
          meta: {
            voucherId,
            newStatus,
          },
        }
      );
    }
  }
}
