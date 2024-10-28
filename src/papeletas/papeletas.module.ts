import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PapeletasController } from './papeletas.controller';
import { PapeletasService } from './papeletas.service';

@Module({
  controllers: [PapeletasController],
  providers: [PapeletasService],
  imports: [ConfigModule],
})
export class PapeletasModule {}
