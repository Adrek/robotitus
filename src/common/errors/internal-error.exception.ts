import { HttpStatus, InternalServerErrorException } from '@nestjs/common';

export class InternalError extends InternalServerErrorException {
  constructor(message: string, logMessages: string[]) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'Internal Error',
      logMessages,
    });
  }
}
