import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { WithSentry } from '@sentry/nestjs';
import { AppLogger } from '../utils/app-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  @WithSentry()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : `${exception}`;

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    // Registrar en el logger (verificando si la excepción tiene stack)
    this.logger.error(
      `Exception thrown: ${message}`,
      exception instanceof Error ? exception.stack ?? '' : 'No stack available',
    );

    response.status(status).json(errorBody);
  }
}
