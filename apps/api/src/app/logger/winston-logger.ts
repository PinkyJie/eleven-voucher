import {
  createLogger,
  transports,
  format,
  Logger as WinstonLogger,
} from 'winston';

import { environment } from '../../environments/environment';

export const WINSTON_LOGGER = Symbol('WinstonLogger');

const customFormatter = format.printf(
  ({ level, message, emitter, timestamp, meta = {} }) => {
    return `[${level}] ${timestamp} [${emitter}] ${message} ${JSON.stringify(
      meta
    )}`;
  }
);

const googleLogFormatter = format(info => {
  info.severity = info.level;
  delete info.level;
  return info;
});

export type Logger = WinstonLogger;

export const winstonLogger = createLogger({
  level: 'debug',
  transports: [new transports.Console()],
  format: environment.production
    ? format.combine(googleLogFormatter(), format.timestamp(), format.json())
    : format.combine(format.colorize(), format.timestamp(), customFormatter),
});
