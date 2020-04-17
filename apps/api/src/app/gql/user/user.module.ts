import { Module } from '@nestjs/common';

import { DbModule } from '../../db/db.module';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [DbModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
