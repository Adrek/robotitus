import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export class DBErrorsHandler {
  static handleDBExceptions(logger: Logger, error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}
