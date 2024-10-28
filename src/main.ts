import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppLogger } from './common/utils/app-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appLogger = new AppLogger(); // Crea una instancia de tu logger personalizado

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Descomentar solo en desarrollo
  app.useGlobalFilters(new AllExceptionsFilter(appLogger));

  await app.listen(3000);
}
bootstrap();
