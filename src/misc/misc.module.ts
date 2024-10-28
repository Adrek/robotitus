import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MiscController } from './misc.controller';
import { MiscService } from './misc.service';

@Module({
  controllers: [MiscController],
  providers: [MiscService],
  imports: [ConfigModule],
})
export class MiscModule {}
