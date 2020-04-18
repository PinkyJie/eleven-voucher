import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { DbModule } from '../../db/db.module';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './firebase.strategy';

@Module({
  imports: [DbModule, PassportModule],
  providers: [AuthResolver, AuthService, FirebaseAuthStrategy],
})
export class AuthModule {}
