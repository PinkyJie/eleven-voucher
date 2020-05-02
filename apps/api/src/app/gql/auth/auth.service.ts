import { Injectable, Inject } from '@nestjs/common';
import admin from 'firebase-admin';

import { DbService } from '../../db/db.service';
import { WINSTON_LOGGER, Logger } from '../../logger/winston-logger';
import { firebaseAuth } from '../../utils/firebase-admin';

import { SessionUser } from './auth.model';

@Injectable()
export class AuthService {
  private loggerInfo = {
    emitter: 'AuthService',
  };
  private auth: admin.auth.Auth;

  constructor(
    @Inject(WINSTON_LOGGER) private logger: Logger,
    private dbService: DbService
  ) {
    this.auth = firebaseAuth;
  }

  async validateToken(token: string): Promise<SessionUser> {
    this.logger.info(`Check if session token is valid`, {
      ...this.loggerInfo,
      meta: {
        token,
      },
    });
    try {
      const decodedToken = await this.auth.verifyIdToken(token, true);
      if (!decodedToken.invitationCode) {
        this.logger.info(`Token does not have invitation code`, {
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
        role: decodedToken.role,
      };
    } catch (e) {
      if (e.code === 'auth/id-token-expired') {
        // ignore error
        this.logger.info(`Token is expired`, {
          ...this.loggerInfo,
          meta: {
            token,
          },
        });
        return null;
      }
      throw e;
    }
  }

  async signup(
    email: string,
    password: string,
    invitationCode: string
  ): Promise<SessionUser> {
    try {
      await this.auth.getUserByEmail(email);
      this.logger.info('Email already exists', {
        ...this.loggerInfo,
        meta: {
          email,
        },
      });
      throw new Error('Email already exists, try to log in directly!');
    } catch (e) {
      if (e.code !== 'auth/user-not-found') {
        throw e;
      }
      // user not existed, good to go
    }

    const invitationDoc = await this.dbService.getInvitationByEmail(email);
    if (
      !invitationDoc.exists ||
      invitationDoc.get('invitationCode') !== invitationCode
    ) {
      this.logger.info('No invitation code attached to this email', {
        ...this.loggerInfo,
        meta: {
          email,
        },
      });
      throw new Error('You are not invited!');
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
