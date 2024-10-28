import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Configuración de Winston con rotación diaria de logs
    this.logger = winston.createLogger({
      level: 'error', // Puedes ajustar el nivel de logs que quieres capturar
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(), // Log en formato JSON para mayor detalle
        winston.format.printf(({ timestamp, level, message, trace }) => {
          return `Level: ${level}\nTimestamp: ${timestamp}\nMessage: ${message}\nStack:\n${trace || 'No stack trace available'}\n`;
        }),
      ),
      transports: [
        // new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          // zippedArchive: true,
          maxSize: '20m', // 'k', 'm', or 'g'. Máximo 20MBbine por archivo
          maxFiles: '14d', // Mantener logs de 14 días
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error({ message, trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
