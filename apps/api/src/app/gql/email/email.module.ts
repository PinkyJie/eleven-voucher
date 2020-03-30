import { Module } from '@nestjs/common';

import { EmailResolver } from './email.resolver';
import { EmailService } from './email.service';

@Module({
  providers: [EmailResolver, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
