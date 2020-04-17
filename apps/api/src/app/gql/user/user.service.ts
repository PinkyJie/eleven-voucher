import { Injectable, Inject } from '@nestjs/common';
import admin from 'firebase-admin';

import { WINSTON_LOGGER, Logger } from '../../logger/winston-logger';
import { DbService } from '../../db/db.service';
import { firebaseAuth } from '../../utils/firebase-admin';

import { SessionUser } from './user.model';

@Injectable()
export class UserService {
  private loggerInfo = {
    emitter: 'UserService',
  };
  private auth: admin.auth.Auth;

  constructor(
    @Inject(WINSTON_LOGGER) private logger: Logger,
    private dbService: DbService
  ) {
    this.auth = firebaseAuth;
  }

  async getSessionUser(token: string): Promise<SessionUser> {
    this.logger.info(`Check if session token is valid`, {
      ...this.loggerInfo,
      meta: {
        token,
      },
    });
    const decodedToken = await this.auth.verifyIdToken(token, true);
    if (!decodedToken.invitationCode) {
      this.logger.error(`Token does not have invitation code`, {
        ...this.loggerInfo,
        meta: {
          token,
          decodedToken,
        },
      });
      return null;
    }
    this.logger.info(`Token is valid`, {
      ...this.loggerInfo,
      meta: {
        token,
        decodedToken,
      },
    });

    return {
      uid: decodedToken.uid,
      email: decodedToken.firebase.identities.email[0],
    };
  }

  async signup(
    email: string,
    password: string,
    invitationCode: string
  ): Promise<SessionUser> {
    const userDoc = await this.dbService.getUserByEmail(email);
    if (!userDoc.exists || userDoc.get('invitationCode') !== invitationCode) {
      this.logger.error('No invitation code attached to this email', {
        ...this.loggerInfo,
        meta: {
          email,
        },
      });
      throw new Error('No invitation code attached to this email!');
    }
    const userRecord = await this.auth.createUser({
      email,
      password,
      emailVerified: true,
      disabled: false,
    });
    await this.auth.setCustomUserClaims(userRecord.uid, {
      invitationCode,
    });
    this.logger.info('Email has been registered successfully', {
      ...this.loggerInfo,
      meta: {
        email,
        invitationCode,
        userRecord,
      },
    });
    return {
      uid: userRecord.uid,
      email,
    };
  }
}
