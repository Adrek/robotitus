import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Browser, ElementHandle } from 'playwright';
import { ExtractionResponse } from '../common/dto/extraction-response.dto';
import { InternalError } from '../common/errors/internal-error.exception';
import { PlayBot } from '../common/utils/play-bot.utils';
import { TwoCaptcha } from '../common/utils/two-captcha.utils';
import { Utils } from '../common/utils/utils';
import { EnvironmentVariables } from '../config/env.config';
import { BonificacionRow } from '../papeletas/dto/bonificacion-row.dto';
import { CursoRow } from '../papeletas/dto/curso-row.dto';
import { DetalleCursoRow } from '../papeletas/dto/detalle-curso-row.dto';
import { PapeletaRow } from '../papeletas/dto/papeleta-row.dto';
import { SLCPData } from '../papeletas/dto/slcp-data.dto';

@Injectable()
export class PapeletasService {
  private readonly proxyHost: string;
  private readonly proxyPort: number;
  private readonly proxyUser: string;
  private readonly proxyPassword: string;
  private readonly twoCaptchaKey: string;

  constructor(private readonly config: ConfigService<EnvironmentVariables>) {
    this.proxyHost = this.config.get('PROXY_HOST', { infer: true })!;
    this.proxyPort = this.config.get('PROXY_PORT', { infer: true })!;
    this.proxyUser = this.config.get('PROXY_USER', { infer: true })!;
    this.proxyPassword = this.config.get('PROXY_PASSWORD', { infer: true })!;
    this.twoCaptchaKey = this.config.get('TWO_CAPTCHA_KEY', { infer: true })!;
  }

  async consultarPuntos(
    tipoDocIdentidad: number,
    nroDocumento: string,
  ): Promise<ExtractionResponse | InternalError> {
    let browser: Browser | undefined;
    let slcpData: SLCPData | null = null;
    let errorMessage: string = '';
    const logMessages: string[] = [];

    try {
      logMessages.push(Utils.log('Conectandose al navegador...'));
      browser = await PlayBot.abrirNavegador({
        browserType: 'chromium',
        hideBrowser: true,
        hostProxy: this.proxyHost,
        portProxy: this.proxyPort.toString(),
        userProxy: this.proxyUser,
        passwordProxy: this.proxyPassword,
      });
      logMessages.push(Utils.log('Navegador conectado!!'));

      logMessages.push(Utils.log('Creación de contexto'));
      const context = await PlayBot.crearNuevoContexto(browser);

      logMessages.push(Utils.log('Navega a la URL'));
      const page = await PlayBot.navegarUrl(
        context,
        'https://slcp.mtc.gob.pe/',
        undefined,
        30000,
      );

      // ****** Seleciona el tipo de documento según el parámetro *******
      logMessages.push(Utils.log('Selecciona el tipo de documento'));
      await PlayBot.buscarSelectYSetear(
        page,
        'select#ddlTipoDocumento',
        `${tipoDocIdentidad}`,
      );

      // Espera a que el select actualice la lógica del input
      await Utils.sleep(1000);

      // ****** Ingresamos el número de documento *******
      logMessages.push(Utils.log('Ingresa el número de documento'));
      await PlayBot.buscarInputYTipear(
        page,
        'input#txtNroDocumento',
        nroDocumento.trim(),
      );

      // Oculta el botón de recargar encima del captcha
      logMessages.push(Utils.log('Oculta imagen de recargar captcha'));
      await PlayBot.ocultarElementoPorId(page, 'btnCaptcha');

      // Toma una captura de la imagen generada del Captcha
      logMessages.push(Utils.log('Captura imagen de captcha'));
      const imageBuffer = await PlayBot.tomarCaptura(page, '#imgCaptcha');

      // Opcional: Guarda la imagen en el sistema de archivos. Carpeta debe estar creada
      // await PlayBot.guardarArchivo(page,`./images/captcha-${Date.now()}.jpeg`,imageBuffer);

      // Convierte la imagen a base64
      const base64Image = imageBuffer.toString('base64');

      // ****** Envia la imagen del Captcha al API de 2Captcha *******
      logMessages.push(Utils.log('Inicia resolución de captcha'));
      const captchaResult = await TwoCaptcha.solveCaptcha(
        this.twoCaptchaKey,
        base64Image,
        this.proxyHost,
        this.proxyPort,
        this.proxyUser,
        this.proxyPassword,
      );

      // ****** Ingresamos el captcha resuelto al input *******
      logMessages.push(
        Utils.log(`Digita captcha resuelto (${captchaResult}) en input`),
      );
      await PlayBot.buscarInputYTipear(page, 'input#txtCaptcha', captchaResult);

      // ****** Seleccionamos el botón de buscar *******
      logMessages.push(Utils.log('Selecciona el botón buscar'));
      await PlayBot.buscarElementoYSeleccionar(page, '#ibtnBusqNroDoc');

      // Esperar hasta que se complete la solicitud específica
      logMessages.push(Utils.log('Espera la respuesta de la misma web'));
      const searchResponse = await page.waitForResponse(
        'https://slcp.mtc.gob.pe/',
      );

      logMessages.push(Utils.log('Comprueba statusCode de respuesta'));
      // Comprueba que la respuesta sea 200
      if (searchResponse.status() !== 200) {
        throw Error(
          'El servicio de SLCP MTC devolvió una respuesta diferente a 200.',
        );
      }

      logMessages.push(Utils.log('Busca mensaje de error, de existir'));
      const selectorModalMensaje: string = '#ModalMensaje';
      const htmlModalMensaje = await PlayBot.buscarElemento(
        page,
        selectorModalMensaje,
      );
      // En este caso, verificamos que exista el modal de mensajes de error
      // Se detectó que ese modal siempre está en el html en modo hidden
      if (!htmlModalMensaje) {
        throw Error(
          'No se encontró el modal de id #ModalMensaje, este siempre debería estar presente por defecto en modo hide',
        );
      }

      // Delay de 600 necesario para esperar si aparece un modal
      await Utils.sleep(600);

      const esModalVisible = await PlayBot.comprobarSiElementoTieneClase(
        page,
        selectorModalMensaje,
        'in',
      );

      if (esModalVisible) {
        logMessages.push(
          Utils.log('Muestra mensaje de error del modal de la web'),
        );
        const mensajeAlerta = await PlayBot.buscarYTraerTexto(page, '#Mensaje');
        throw Error(`[ModalAlerta]: ${mensajeAlerta}`);
      }

      // ****** COMPROBAMOS QUE NO APAREZCA EL MENSAJE "NO RESULTADOS" *******
      logMessages.push(Utils.log('Busca mensaje "NoExiste", de ser el caso'));
      // Aquí desactivamos el error que manda la función buscarElemento cuando no encuentra
      // un elemento ya que la lógica de negocios lo requiere
      const selectorMensajeNoExiste: string = '#lblMensajeNoExiste';
      let htmlMensajeNoExiste: ElementHandle<Element> | null = null;
      try {
        htmlMensajeNoExiste = await PlayBot.buscarElemento(
          page,
          selectorMensajeNoExiste,
        );
      } catch (error) {
        // Para este caso capturamos el error, porque quiero que flujo siga
      }

      if (htmlMensajeNoExiste) {
        logMessages.push(Utils.log('Captura mensaje "NoExiste"'));
        const noEncontradoMensaje = await PlayBot.buscarYTraerTexto(
          page,
          selectorMensajeNoExiste,
        );

        await this.dispose(browser, logMessages);
        return {
          success: false,
          data: null,
          errorMessage: noEncontradoMensaje,
          logMessages: logMessages,
        } as ExtractionResponse;
      }

      // EN ESTE PUNTO HAY RESULTADOS

      // ****** EXTRACCIÓN DE RESULTADOS *******
      logMessages.push(Utils.log('Capturamos los datos'));
      // ****** Extración de Cabecera *******
      const resAdministrado = await PlayBot.buscarYTraerTexto(
        page,
        '#lblAdministrado',
      );
      const resNroDocumento = await PlayBot.buscarYTraerTexto(page, '#lblDni');
      const resNroLicencia = await PlayBot.buscarYTraerTexto(
        page,
        '#lblLicencia',
      );
      const resVigencia = await PlayBot.buscarYTraerTexto(page, '#lblVigencia');
      const resEstadoLicencia = await PlayBot.buscarYTraerTexto(
        page,
        '#lblEstadoLicencia',
      );
      const resPuntosAcumulados = await PlayBot.buscarYTraerTexto(
        page,
        '#lblPtsAcumulados',
      );

      // ****** Extración de información sobre Papeletas *******
      const papeletas: PapeletaRow[] = await page.$$eval(
        '#gvPapeletas tr.gridItemGroup',
        (rows) => {
          return rows.map((row) => {
            const htmlCells = row.querySelectorAll('td');

            const cells = Array.from(
              htmlCells,
              (cell) => cell.textContent || cell.innerText,
            );

            return {
              entidad: cells[1].trim(),
              papeleta: cells[2].trim(),
              fecha: cells[3].trim(),
              fechaFirme: cells[4].trim(),
              falta: cells[5].trim(),
              resolucion: cells[6].trim(),
              puntosFirmes: +cells[7].trim(),
              puntosProceso: +cells[8].trim(),
            } as PapeletaRow;
          });
        },
      );

      // ****** Extración de información sobre Cursos y su detalle *******
      const cursos: CursoRow[] = [];
      const tagSelectorCursosTd =
        '#gvJornadasCursos > tbody > tr:not(.gridHead)';
      const rowsCursos = await page.$$(tagSelectorCursosTd);

      for (let i = 0; i < rowsCursos.length; i++) {
        const row = (await page.$$(tagSelectorCursosTd))[i];

        const tempDetalle: DetalleCursoRow[] = [];

        // Recoge la información de cada celda en la fila excepto el botón
        const cellData = await row.$$eval('td', (cells) =>
          cells.map((cell) => cell.textContent || cell.innerText),
        );

        // Haz clic en el botón/link que abre el modal
        const aLinkModal = await row.$('td > a[id^="gvJornadasCursos_"]'); // Ajusta el selector según sea necesario
        await aLinkModal?.click();

        // Espera a que el modal esté completamente cargado
        await page.waitForSelector('#DetalleJorCur', {
          timeout: 3000,
          state: 'visible',
        });

        const rowsDetalle = await page.$$(
          '#gvPapeletasJorCur > tbody > tr:not(.gridHead)',
        );

        for (const rowDetalle of rowsDetalle) {
          const detalleColumns = await rowDetalle.$$eval('td', (cells) =>
            cells.map((cell) => cell.textContent || cell.innerText),
          );

          const respDetalle: DetalleCursoRow = {
            entidad: detalleColumns[1].trim(),
            papeleta: detalleColumns[2].trim(),
            fechaInfraccion: detalleColumns[3].trim(),
            fechaFirme: detalleColumns[4].trim(),
            falta: detalleColumns[5].trim(),
            puntos: +detalleColumns[6].trim(),
          };

          tempDetalle.push(respDetalle);
        }

        // Delay necesario hasta que el modal se muestre
        await Utils.sleep(600);

        // Click en el botón para cerrar el modal
        await PlayBot.buscarElementoYSeleccionar(
          page,
          '#DetalleJorCur div.modal-footer button[data-dismiss="modal"]',
        );

        const resp: CursoRow = {
          entidad: cellData[1].trim(),
          capacitacion: cellData[2].trim(),
          certificado: cellData[3].trim(),
          fecha: cellData[4].trim(),
          papeleta: cellData[5].trim(),
          puntos: +cellData[6].trim(),
          detalle: tempDetalle,
        };

        cursos.push(resp);

        // Delay necesario hasta que el modal se oculte
        await Utils.sleep(600);
      }

      // ****** Extración de información sobre Bonificaciones *******
      const bonificaciones: BonificacionRow[] = await page.$$eval(
        '#gvBonificacion tr.gridItemGroup',
        (rows) => {
          return rows.map((row) => {
            const htmlCells = row.querySelectorAll('td');

            const cells = Array.from(
              htmlCells,
              (cell) => cell.textContent || cell.innerText,
            );

            return {
              documento: cells[1].trim(),
              fechaBonificacion: cells[2].trim(),
              vigenteHasta: cells[3].trim(),
              disponible: +cells[4].trim(),
              utilizado: +cells[5].trim(),
            } as BonificacionRow;
          });
        },
      );

      logMessages.push(Utils.log('Data final construida'));
      slcpData = {
        administrado: resAdministrado,
        dni: resNroDocumento,
        licencia: resNroLicencia,
        vigencia: resVigencia,
        estadoLicencia: resEstadoLicencia,
        puntosAcumulados: +resPuntosAcumulados,
        papeletas: papeletas,
        cursos: cursos,
        bonificaciones: bonificaciones,
      };

      await this.dispose(browser, logMessages);
      return {
        success: true,
        data: slcpData,
        errorMessage: null,
        logMessages: logMessages,
      } as ExtractionResponse;
    } catch (error) {
      errorMessage = error.message || error;

      if (errorMessage == 'ERROR_NO_SLOT_AVAILABLE') {
        logMessages.push(
          Utils.log('Error: ERROR_NO_SLOT_AVAILABLE. Esperando de 5 segundos.'),
        );
        // Sleep 05 segundos, según recomendación. Ref: https://2captcha.com/api-docs/limits
        await Utils.sleep(5000);
      }

      await this.dispose(browser, logMessages);
      throw new InternalError(errorMessage, logMessages);
    }
  }

  private async dispose(browser: Browser | undefined, logMessages: string[]) {
    if (browser) {
      logMessages.push(Utils.log('Cerrando navegador'));
      await browser.close();
      logMessages.push(Utils.log('Navegador cerrado!'));
    }
  }
}
