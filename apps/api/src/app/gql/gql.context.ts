import { Request } from 'express';

import { SessionUser } from './auth/auth.model';

export class GqlContext {
  deviceId: string;
  req: Request & {
    user?: SessionUser;
  };
}
