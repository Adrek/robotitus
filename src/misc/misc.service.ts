import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Browser } from 'playwright';
import { PlayBot } from 'src/common/utils/play-bot.utils';
import { Utils } from 'src/common/utils/utils';
import { EnvironmentVariables } from 'src/config/env.config';

@Injectable()
export class MiscService {
  private readonly proxyHost: string;
  private readonly proxyPort: number;
  private readonly proxyUser: string;
  private readonly proxyPassword: string;

  constructor(private readonly config: ConfigService<EnvironmentVariables>) {
    this.proxyHost = this.config.get('PROXY_HOST', { infer: true })!;
    this.proxyPort = this.config.get('PROXY_PORT', { infer: true })!;
    this.proxyUser = this.config.get('PROXY_USER', { infer: true })!;
    this.proxyPassword = this.config.get('PROXY_PASSWORD', { infer: true })!;
  }

  async abrirNavegador(sleepTime: number) {
    let browser: Browser | undefined;
    try {
      browser = await PlayBot.abrirNavegador({
        browserType: 'chromium',
        hideBrowser: false,
        hostProxy: this.proxyHost,
        portProxy: this.proxyPort.toString(),
        userProxy: this.proxyUser,
        passwordProxy: this.proxyPassword,
      });
      const context = await PlayBot.crearNuevoContexto(browser);

      await PlayBot.navegarUrl(context, 'https://es.wikipedia.org/');

      await Utils.sleep(sleepTime);

      await browser.close();
    } catch (error) {
      console.log(error);
    } finally {
      await browser?.close();
    }
  }

  async cerrarNavegador() {
    let browser: Browser | undefined;

    try {
      throw Error('Errortest');
    } catch (error) {
      await browser?.close();
    }
  }
}
