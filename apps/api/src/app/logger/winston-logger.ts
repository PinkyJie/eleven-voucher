import {
  createLogger,
  transports,
  format,
  Logger as WinstonLogger,
} from 'winston';

export const WINSTON_LOGGER = Symbol('WinstonLogger');

const customFormatter = format.printf(
  ({ level, message, emitter, timestamp, meta = {} }) => {
    return `[${level}] ${timestamp} [${emitter}] ${message} ${JSON.stringify(
      meta
    )}`;
  }
);

export type Logger = WinstonLogger;

export const winstonLogger = createLogger({
  level: 'debug',
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    customFormatter
  ),
});
