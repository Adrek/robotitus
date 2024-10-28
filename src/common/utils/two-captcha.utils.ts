import axios, { AxiosRequestConfig } from 'axios';
import { Constants } from '../constants/constants';
import { CreateTaskResponse, GetTaskResultResponse } from '../interfaces';

export class TwoCaptcha {
  static async solveCaptcha(
    clientKey: string,
    imgBase64: string,
    hostProxy?: string,
    portProxy?: number,
    userProxy?: string,
    passwordProxy?: string,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Lógica para enviar la imagen y crear el task
        // console.log('[2Captcha] creando tarea...');
        const taskResponse = await TwoCaptcha.createTask(
          clientKey,
          imgBase64,
          hostProxy,
          portProxy,
          userProxy,
          passwordProxy,
        );

        const taskId = taskResponse.taskId;

        // Función para obtener el resultado del task después de un tiempo específico
        // console.log('[2Captcha] resolviendo captcha...');
        const result = await TwoCaptcha.waitForResult(
          clientKey,
          taskId,
          hostProxy,
          portProxy,
          userProxy,
          passwordProxy,
        );

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async createTask(
    clientKey: string,
    imgBase64: string,
    hostProxy?: string,
    portProxy?: number,
    userProxy?: string,
    passwordProxy?: string,
  ): Promise<CreateTaskResponse> {
    const config: AxiosRequestConfig = {
      timeout: 5000, // La respuesta debe ser instantánea
    };

    if (hostProxy && portProxy && userProxy && passwordProxy) {
      config.proxy = {
        protocol: 'http',
        host: hostProxy,
        port: portProxy,
        auth: {
          username: userProxy,
          password: passwordProxy,
        },
      };
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          'https://api.2captcha.com/createTask',
          {
            clientKey: clientKey,
            task: {
              type: 'ImageToTextTask',
              body: imgBase64,
              numeric: 1,
              minLength: 6,
              maxLength: 6,
            },
          },
          config,
        );

        // Procesar la respuesta y obtener el texto decodificado
        const result = response.data as CreateTaskResponse;

        if (result.errorId !== 0) {
          reject(result.errorCode);
        }

        resolve(result);
      } catch (error) {
        reject(`[Axios Error] createTask: ${error.message}`);
      }
    });
  }

  static async getTaskResult(
    clientKey: string,
    taskId: number,
    hostProxy?: string,
    portProxy?: number,
    userProxy?: string,
    passwordProxy?: string,
  ): Promise<GetTaskResultResponse> {
    const config: AxiosRequestConfig = {
      timeout: 5000, // La respuesta debe ser instantánea
    };

    if (hostProxy && portProxy && userProxy && passwordProxy) {
      config.proxy = {
        protocol: 'http',
        host: hostProxy,
        port: portProxy,
        auth: {
          username: userProxy,
          password: passwordProxy,
        },
      };
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          'https://api.2captcha.com/getTaskResult',
          {
            clientKey: clientKey,
            taskId: taskId,
          },
          config,
        );
        // Procesar la respuesta y obtener el texto decodificado
        const result = response.data as GetTaskResultResponse;
        resolve(result);
      } catch (error) {
        reject(`[Axios Error] getTaskResult: ${error.message}`);
      }
    });
  }

  static async waitForResult(
    clientKey: string,
    taskId: number,
    hostProxy?: string,
    portProxy?: number,
    userProxy?: string,
    passwordProxy?: string,
  ): Promise<string> {
    const INTERVAL = 3000; // Intervalo en milisegundos para verificar el resultado

    return new Promise<string>((resolve, reject) => {
      let attempts: number = 0;
      const checkResult = async () => {
        try {
          if (attempts * INTERVAL > Constants.timeout2CaptchaResult) {
            throw new Error(
              `Tiempo de respuesta GetTaskResult excedido: ${Constants.timeout2CaptchaResult}ms`,
            );
          }
          attempts++;
          const taskResult = await TwoCaptcha.getTaskResult(
            clientKey,
            taskId,
            hostProxy,
            portProxy,
            userProxy,
            passwordProxy,
          );
          if (taskResult.errorId == 0 && taskResult.status == 'ready') {
            resolve(taskResult.solution?.text ?? '');
          } else {
            setTimeout(checkResult, INTERVAL);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkResult(); // Llamar a la función por primera vez
    });
  }
}
