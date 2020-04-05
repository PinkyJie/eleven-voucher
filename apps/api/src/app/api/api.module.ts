import { Module, Global } from '@nestjs/common';

import { ApiService } from './api.service';

@Global()
@Module({
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
