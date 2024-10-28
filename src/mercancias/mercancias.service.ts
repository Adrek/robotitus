import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Browser, BrowserContext, ElementHandle } from 'playwright';
import { ExtractionResponse } from '../common/dto/extraction-response.dto';
import { InternalError } from '../common/errors/internal-error.exception';
import { PlayBot } from '../common/utils/play-bot.utils';
import { EnvironmentVariables } from '../config/env.config';

import { Utils } from '../common/utils/utils';
import { Mercaderia } from './dto/mercaderia.dto';

@Injectable()
export class MercanciasService {
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

  async extraerInformacionWeb(
    tipoBusqueda: number,
    valorBusqueda: string,
  ): Promise<ExtractionResponse | InternalError> {
    let browser: Browser | undefined;
    let context: BrowserContext | undefined;
    let finalData: Mercaderia | null = null;
    let errorMessage: string = '';
    const logMessages: string[] = [];

    try {
      logMessages.push(Utils.log('Conectandose al navegador...'));
      browser = await PlayBot.abrirNavegador({
        browserType: 'webkit',
        hideBrowser: true,
        hostProxy: this.proxyHost,
        portProxy: this.proxyPort.toString(),
        userProxy: this.proxyUser,
        passwordProxy: this.proxyPassword,
      });
      logMessages.push(Utils.log('Navegador conectado!!'));

      logMessages.push(Utils.log('Creación de contexto'));
      context = await PlayBot.crearNuevoContexto(browser);

      logMessages.push(Utils.log('Navega a la URL'));
      const page = await PlayBot.navegarUrl(
        context,
        'https://www.mtc.gob.pe/tramitesenlinea/tweb_tLinea/tw_consultadgtt/Frm_rep_intra_mercancia.aspx',
      );

      // ****** Seleccionamos la opción del radioGroup *******
      logMessages.push(
        Utils.log('Seleccionamos la opción del radioGroup rbOpciones'),
      );
      await PlayBot.buscarElementoYSeleccionar(
        page,
        `input[name="rbOpciones"][value="${tipoBusqueda}"]`,
      );

      // ****** Ingresamos el número de documento al input *******
      logMessages.push(
        Utils.log('Ingresamos el número de documento al input input#txtValor'),
      );
      await PlayBot.buscarInputYTipear(page, 'input#txtValor', valorBusqueda);

      // ****** Seleccionamos el botón de buscar *******
      logMessages.push(Utils.log('Seleccionamos el botón de buscar'));
      await PlayBot.buscarElementoYSeleccionar(page, '#btnBuscar');

      // Espera al id existentente de la siguiente página
      logMessages.push(Utils.log('Esperamos el elemento frmDisplay'));

      await PlayBot.esperarElemento(page, '#frmDisplay');

      logMessages.push(
        Utils.log('Buscamos resultados mediante el div#lblHtml'),
      );

      let htmlIdDivResultados: ElementHandle<Element> | null = null;

      try {
        htmlIdDivResultados = await PlayBot.buscarElemento(page, '#lblHtml');
      } catch (error) {
        // Para este caso capturamos el error, porque quiero que flujo siga
      }

      // En este caso, verificamos que exista el id ancestro de la tabla de resultados
      if (!htmlIdDivResultados) {
        logMessages.push(
          Utils.log(
            'No se encontró div#lblHtml. Buscar el texto con mensaje de error.',
          ),
        );

        logMessages.push(Utils.log('Buscamos el div#lblMensaje.'));
        const selectorErrorMensaje = '#lblMensaje';
        let htmlErrorMensaje: ElementHandle<Element> | null = null;

        try {
          htmlErrorMensaje = await PlayBot.buscarElemento(
            page,
            selectorErrorMensaje,
          );
        } catch (error) {
          // Para este caso capturamos el error, porque quiero que flujo siga
        }

        if (!htmlErrorMensaje) {
          logMessages.push(Utils.log('No se encontró el div div#lblMensaje.'));
          throw Error('No se encontró el id #lblMensaje del mensaje de error.');
        } else {
          logMessages.push(
            Utils.log('Obtenemos el texto del div div#lblMensaje.'),
          );
          const noResults = await PlayBot.buscarYTraerTexto(
            page,
            selectorErrorMensaje,
          );

          logMessages.push(
            Utils.log('Devolvemos respuesta de error con div#lblMensaje.'),
          );
          await this.dispose(browser, context, logMessages);
          return {
            success: false,
            data: null,
            errorMessage: noResults,
            logMessages: logMessages,
          } as ExtractionResponse;
        }
      }

      // ****** Contamos la cantidad de resultados obtenidos *******
      logMessages.push(Utils.log('Cantidad de resultados obtenidos'));
      const cantidadResultados = (
        await PlayBot.buscarVariosElementos(page, '#lblHtml a')
      ).length;

      // ****** Seleccionamos el botón de buscar *******
      logMessages.push(Utils.log('Seleccionamos el botón del link al detalle'));
      await PlayBot.buscarElementoYSeleccionar(page, '#lblHtml a');

      // Espera al id existentente de la siguiente página
      logMessages.push(Utils.log('Buscamos el div con los datos'));
      await PlayBot.esperarElemento(page, '#frmDatos');

      // ****** EXTRACCIÓN DE RESULTADOS *******
      // ****** Extración de Cabecera *******
      logMessages.push(Utils.log('Capturamos los datos'));
      const resCodigoRazonSocial = await PlayBot.buscarYTraerTexto(
        page,
        '#lblCodigo',
      );

      const resRazonSocial = await PlayBot.buscarYTraerTexto(
        page,
        '#lblRazonSocial',
      );

      const resRUC = await PlayBot.buscarYTraerTexto(page, '#lblRuc');

      const resDireccion = await PlayBot.buscarYTraerTexto(
        page,
        '#lblDireccion',
      );

      const resTelefonos = await PlayBot.buscarYTraerTexto(
        page,
        '#lblTelefono',
      );

      const resCiudadInscripcion = await PlayBot.buscarYTraerTexto(
        page,
        '#lblCiudad',
      );

      const resTipoPersoneria = await PlayBot.buscarYTraerTexto(
        page,
        '#lblTipPersoneria',
      );

      const resModalidadEmpresa = await PlayBot.buscarYTraerTexto(
        page,
        '#lblModalidad',
      );

      const resEstado = await PlayBot.buscarYTraerTexto(page, '#lblEstado');

      const resVigenteHasta = await PlayBot.buscarYTraerTexto(
        page,
        '#lblVigencia',
      );

      logMessages.push(Utils.log('Data final construida'));
      finalData = {
        codigoRazonSocial: resCodigoRazonSocial.trim(),
        razonSocial: resRazonSocial.trim(),
        ruc: resRUC.trim(),
        direccion: resDireccion.trim(),
        telefonos: resTelefonos.trim(),
        ciudadInscripcion: resCiudadInscripcion.trim(),
        tipoPersoneria: resTipoPersoneria.trim(),
        modalidadEmpresa: resModalidadEmpresa.trim(),
        estado: resEstado.trim(),
        vigenteHasta: resVigenteHasta.trim(),
        cantidadResultados: cantidadResultados,
      };

      await this.dispose(browser, context, logMessages);
      return {
        success: true,
        data: finalData,
        errorMessage: null,
        logMessages: logMessages,
      } as ExtractionResponse;
    } catch (error) {
      errorMessage = error.message || error;

      await this.dispose(browser, context, logMessages);
      throw new InternalError(errorMessage, logMessages);
    }
  }

  private async dispose(
    browser: Browser | undefined,
    context: BrowserContext | undefined,
    logMessages: string[],
  ) {
    if (context) {
      logMessages.push(Utils.log('Cerrando BrowserContext'));
      await context.close();
      logMessages.push(Utils.log('BrowserContext cerrado!'));
    }

    if (browser) {
      logMessages.push(Utils.log('Cerrando navegador'));
      await browser.close();
      logMessages.push(Utils.log('Navegador cerrado!'));
    }
  }
}
