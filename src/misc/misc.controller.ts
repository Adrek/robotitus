import { Controller, Get, Query } from '@nestjs/common';
import { MiscService } from './misc.service';

@Controller('misc')
export class MiscController {
  constructor(private readonly miscService: MiscService) {}

  @Get('/debug-sentry')
  getError() {
    throw new Error('Sentry error!');
  }

  @Get('/browser-error')
  async browserError(@Query('sleepTime') sleepTime: string) {
    await this.miscService.abrirNavegador(+sleepTime);
    return 'finish!';
  }

  @Get('/browser-close')
  closeError() {
    this.miscService.cerrarNavegador();
  }
}
