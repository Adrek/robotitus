import * as Joi from 'joi';

export interface EnvironmentVariables {
  PROXY_HOST: string;
  PROXY_PORT: number;
  PROXY_USER: string;
  PROXY_PASSWORD: string;
  TWO_CAPTCHA_KEY: string;
  SENTRY_DSN: string;
}

export const JoiValidationSchema = Joi.object<EnvironmentVariables>({
  PROXY_HOST: Joi.required(),
  PROXY_PORT: Joi.required(),
  PROXY_USER: Joi.required(),
  PROXY_PASSWORD: Joi.required(),
  TWO_CAPTCHA_KEY: Joi.required(),
  SENTRY_DSN: Joi.required(),
});
