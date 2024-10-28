import { writeFile } from 'fs/promises';
import {
  Browser,
  BrowserContext,
  BrowserType,
  chromium,
  ElementHandle,
  firefox,
  LaunchOptions,
  Page,
  webkit,
} from 'playwright';

export interface PlayBotLaunchOptions {
  browserType?: 'webkit' | 'chromium' | 'firefox';
  hideBrowser?: boolean;
  hostProxy?: string;
  portProxy?: string;
  userProxy?: string;
  passwordProxy?: string;
}

export class PlayBot {
  static async abrirNavegador(
    options?: PlayBotLaunchOptions,
  ): Promise<Browser> {
    const launchOptions: LaunchOptions = {
      headless: options?.hideBrowser ?? true,
    };

    // Esta línea es para ingresar nuestras credenciales de proxy
    if (
      options?.hostProxy &&
      options?.portProxy &&
      options?.userProxy &&
      options?.passwordProxy
    ) {
      launchOptions.proxy = {
        server: `http://${options?.hostProxy}:${options?.portProxy}`,
        username: options?.userProxy,
        password: options?.passwordProxy,
      };
    }

    let engineType: BrowserType = webkit;

    switch (options?.browserType) {
      case 'webkit':
        engineType = webkit;
        break;
      case 'chromium':
        engineType = chromium;
        break;
      case 'firefox':
        engineType = firefox;
        break;
    }

    return engineType.launch(launchOptions);
  }

  static async crearNuevoContexto(browser: Browser): Promise<BrowserContext> {
    return browser.newContext();
  }

  static async navegarUrl(
    context: BrowserContext,
    url: string,
    htmlContent?: string,
    timeout?: number,
  ): Promise<Page> {
    const page = await context.newPage();

    // Agrega un listener para mostrar los mensajes posteriores de console.log
    // page.on('console', (msg) => console[msg.type()]('CHROME LOG:', msg.text()));

    if (htmlContent) {
      // Carga el contenido HTML en la página
      await page.setContent(htmlContent);
      // Enfoca la página o la trae al frente para un correcto funcionamiento
      await page.bringToFront();
    } else {
      // Navega hasta la url enviada por parámetro
      await page.goto(url, { waitUntil: 'networkidle', timeout });
      // Enfoca la página o la trae al frente para un correcto funcionamiento
      await page.bringToFront();
    }

    return page;
  }

  // //****** MÉTODOS DE BÚSQUEDA Y SELECCIÓN *******/
  static async buscarElemento(
    page: Page,
    selector: string,
  ): Promise<ElementHandle<Element>> {
    // Busca el elemento por su selector
    const elementHandle = await page.$(selector);

    if (!elementHandle) {
      throw Error(`No se encontró el elemento con selector: ${selector}`);
    }

    return elementHandle;
  }

  static async buscarVariosElementos(
    page: Page,
    selector: string,
    enableNotFoundError: boolean = true,
  ): Promise<ElementHandle<Element>[]> {
    // Busca el elemento por su selector
    const elementHandle = await page.$$(selector);

    if (enableNotFoundError) {
      if (!elementHandle) {
        throw Error(`No se encontraron elementos con selector: ${selector}`);
      }
    }

    return elementHandle;
  }

  static async esperarElemento(
    page: Page,
    selector: string,
    enableNotFoundError: boolean = true,
  ): Promise<ElementHandle<Element>> {
    // Esperar el elemento por su selector
    const elementHandle = await page.waitForSelector(selector);

    if (enableNotFoundError) {
      if (!elementHandle) {
        throw Error(
          `No se encontró el elemento tras la espera del selector ${selector}`,
        );
      }
    }

    return elementHandle;
  }

  static async buscarYTraerTexto(
    page: Page,
    selector: string,
  ): Promise<string> {
    const elementHandle = await PlayBot.buscarElemento(page, selector);

    return elementHandle.evaluate<string>(
      (element) => element.textContent ?? '',
    );
  }

  static async buscarSelectYSetear(
    page: Page,
    selector: string,
    valueToSelect: string,
  ): Promise<void> {
    const elementHandle = await PlayBot.buscarElemento(page, selector);

    await elementHandle.selectOption(valueToSelect);
  }

  static async buscarInputYTipear(
    page: Page,
    selector: string,
    valueToEnter: string,
  ): Promise<void> {
    const elementHandle = await PlayBot.buscarElemento(page, selector);

    await elementHandle.fill(valueToEnter);
  }

  static async buscarElementoYSeleccionar(
    page: Page,
    selector: string,
    timeout?: number,
  ): Promise<void> {
    const botonSelector = selector;
    await page.waitForSelector(botonSelector, {
      timeout: timeout ?? 0,
    }); // Esperar a que el botón esté disponible
    await page.click(botonSelector);
  }

  // //****** MÉTODOS DE COMPROBACIÓN *******/
  static async comprobarSiElementoTieneClase(
    page: Page,
    selector: string,
    className: string,
  ): Promise<boolean> {
    const elementHandle = await PlayBot.buscarElemento(page, selector);

    // Verifica si contiene clase
    return elementHandle.evaluate((element, classNameParam) => {
      return element.classList.contains(classNameParam);
    }, className);
  }

  // //****** MÉTODOS DE OCULTAMIENTO *******/
  static async ocultarElementoPorId(page: Page, id: string): Promise<void> {
    await page.evaluate((idParam) => {
      const element = document.getElementById(idParam);
      if (element) {
        console.log(`Se ocultó el elemento #${idParam}`);
        element.style.display = 'none';
      }
    }, id);
  }

  static async tomarCaptura(page: Page, selector: string): Promise<Buffer> {
    const elementHandle = await PlayBot.buscarElemento(page, selector);

    // Retorno imageBuffer
    return elementHandle.screenshot();
  }

  static async tomarCapturaBase64(
    page: Page,
    selector: string,
  ): Promise<string> {
    const imageBuffer = await this.tomarCaptura(page, selector);

    return imageBuffer.toString('base64');
  }

  static async guardarArchivo(
    page: Page,
    path: string,
    imageBuffer: Buffer,
  ): Promise<void> {
    await writeFile(path, imageBuffer);
  }
}
