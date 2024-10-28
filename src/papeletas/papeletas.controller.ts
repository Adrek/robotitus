import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ExtractionResponse } from '../common/dto/extraction-response.dto';
import { InternalError } from '../common/errors/internal-error.exception';
import { PapeletasService } from './papeletas.service';

@Controller('papeletas')
export class PapeletasController {
  constructor(private readonly papeletasService: PapeletasService) {}

  @Get('consultarpuntos')
  async consultarPuntos(
    @Query('tipoDocIdentidad') tipoDocIdentidad: string,
    @Query('nroDocumento') nroDocumento: string,
  ): Promise<ExtractionResponse | InternalError> {
    if (!tipoDocIdentidad || !nroDocumento) {
      throw new InternalServerErrorException(
        `Se deben enviar todos los parámetros`,
      );
    }

    return this.papeletasService.consultarPuntos(
      +tipoDocIdentidad.trim(),
      nroDocumento.trim(),
    );
  }
}
