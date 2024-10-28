import * as Sentry from '@sentry/nestjs';
import 'dotenv/config';

Sentry.init({
  enabled: false,
  environment: process.env.NODE_ENV,
  dsn: process.env.SENTRY_DSN,
  debug: +process.env.SENTRY_DEBUG_ENABLED! === 1,
});
