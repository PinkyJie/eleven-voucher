import { Module } from '@nestjs/common';

import { VoucherResolver } from './voucher.resolver';
import { VoucherService } from './voucher.service';

@Module({
  providers: [VoucherResolver, VoucherService],
})
export class VoucherModule {}
