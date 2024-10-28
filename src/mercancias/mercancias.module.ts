import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MercanciasController } from './mercancias.controller';
import { MercanciasService } from './mercancias.service';

@Module({
  controllers: [MercanciasController],
  providers: [MercanciasService],
  imports: [ConfigModule],
})
export class MercanciasModule {}
