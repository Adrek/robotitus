import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';

import { ScheduleModule } from '@nestjs/schedule';

import { JoiValidationSchema } from './config/env.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MercanciasModule } from './mercancias/mercancias.module';
import { MiscModule } from './misc/misc.module';
import { PapeletasModule } from './papeletas/papeletas.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: JoiValidationSchema,
    }),
    ScheduleModule.forRoot(),
    MercanciasModule,
    PapeletasModule,
    MiscModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
