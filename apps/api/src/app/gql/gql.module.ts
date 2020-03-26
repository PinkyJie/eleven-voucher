import { Module } from '@nestjs/common';

import { SevenElevenModule } from './seven-eleven/seven-eleven.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [EmailModule, SevenElevenModule],
})
export class GqlModule {}
