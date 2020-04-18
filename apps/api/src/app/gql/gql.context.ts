import { Request } from 'express';

export class GqlContext {
  deviceId: string;
  req: Request;
}
