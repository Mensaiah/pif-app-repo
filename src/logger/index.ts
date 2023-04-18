import winston from 'winston';
import path from 'path';

const transports: winston.transport[] = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(__dirname, '..', '..', 'logs', 'combined.log'),
    level: 'info',
  }),
  new winston.transports.File({
    filename: path.join(__dirname, '..', '..', 'logs', 'errors.log'),
    level: 'error',
  }),
];

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp(),
    winston.format.label({ label: 'SMS API' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    winston.format.printf(({ timestamp, label, level, message }: any) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '..', '..', 'logs', 'exceptions.log'),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
export default logger;
