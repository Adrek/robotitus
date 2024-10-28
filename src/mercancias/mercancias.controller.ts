import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ExtractionResponse } from '../common/dto/extraction-response.dto';
import { InternalError } from '../common/errors/internal-error.exception';
import { MercanciasService } from './mercancias.service';

@Controller('mercancias')
export class MercanciasController {
  constructor(private readonly mercanciasService: MercanciasService) {}

  @Get('consultar')
  async consultar(
    @Query('tipoBusqueda') tipoBusqueda: string,
    @Query('valorBusqueda') valorBusqueda: string,
  ): Promise<ExtractionResponse | InternalError> {
    if (!tipoBusqueda || !valorBusqueda) {
      throw new InternalServerErrorException(
        `Se deben enviar todos los parámetros`,
      );
    }

    return this.mercanciasService.extraerInformacionWeb(
      +tipoBusqueda.trim(),
      valorBusqueda.trim(),
    );
  }
}
