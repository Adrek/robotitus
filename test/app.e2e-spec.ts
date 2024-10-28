import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('RobotSAT - Pruebas de integración (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('API - Ping de prueba', async () => {
    const response = await request(app.getHttpServer()).get('/ping');
    expect(response.statusCode).toBe(200);
  });

  it('Papeletas - Consulta documento no registrado', async () => {
    // Consulta de un documento que no está registrado en SLCP
    const response = await request(app.getHttpServer())
      .get('/papeletas/consultarpuntos')
      .query({ tipoDocIdentidad: 2, nroDocumento: '43083914' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.errorMessage).not.toBeNull();
  }, 15000);

  it('Papeletas - Consulta documento registrado que no tiene historial', async () => {
    // Consulta un documento registrado que no tiene ni papeletas, ni cursos, ni bonificaciones
    const dni = '70500954';
    const response = await request(app.getHttpServer())
      .get('/papeletas/consultarpuntos')
      .query({ tipoDocIdentidad: 2, nroDocumento: dni });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data.administrado');
    expect(response.body).toHaveProperty('data.dni', dni);
    expect(response.body).toHaveProperty('data.licencia');
    expect(response.body).toHaveProperty('data.vigencia');
    expect(response.body).toHaveProperty('data.estadoLicencia');
    expect(response.body).toHaveProperty('data.puntosAcumulados');
    expect(response.body).toHaveProperty('data.papeletas');
    expect(response.body).toHaveProperty('data.cursos');
    expect(response.body).toHaveProperty('data.bonificaciones');
    expect(response.body.data.papeletas).toHaveLength(0);
    expect(response.body.data.cursos).toHaveLength(0);
    expect(response.body.data.bonificaciones).toHaveLength(0);
  }, 15000);

  it('Papeletas - Consulta documento registrado con historial', async () => {
    // Consulta un documento registrado que tiene papeletas y bonificaciones
    const dni = '04053437';
    const response = await request(app.getHttpServer())
      .get('/papeletas/consultarpuntos')
      .query({ tipoDocIdentidad: 2, nroDocumento: dni });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data.administrado');
    expect(response.body).toHaveProperty('data.dni', dni);
    expect(response.body).toHaveProperty('data.licencia');
    expect(response.body).toHaveProperty('data.vigencia');
    expect(response.body).toHaveProperty('data.estadoLicencia');
    expect(response.body).toHaveProperty('data.puntosAcumulados');
    expect(response.body).toHaveProperty('data.papeletas');
    expect(response.body).toHaveProperty('data.cursos');
    expect(response.body).toHaveProperty('data.bonificaciones');
    expect(response.body.data.papeletas).not.toHaveLength(0);
    expect(response.body.data.bonificaciones).not.toHaveLength(0);
  }, 15000);

  it('Papeletas - Consulta cursos y su detalle', async () => {
    // Consulta el siguiente dni que tiene cursos y por ende detalle
    const dni = '09920271';
    const response = await request(app.getHttpServer())
      .get('/papeletas/consultarpuntos')
      .query({ tipoDocIdentidad: 2, nroDocumento: dni });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data.cursos');
    expect(response.body.data.cursos).not.toHaveLength(0);
    expect(response.body).toHaveProperty('data.cursos[0].detalle');
  }, 15000);

  it('Mercancias - Valida parámetros completos', async () => {
    // Enviando un request con parámetros incompletos
    const response = await request(app.getHttpServer())
      .get('/mercancias/consultar')
      .query({ tipoBusqueda: 4 });

    expect(response.statusCode).toBe(500);
  });

  it('Mercancias - Captura error al buscar placa no registrada', async () => {
    // Enviando un request con parámetros incompletos
    const response = await request(app.getHttpServer())
      .get('/mercancias/consultar')
      .query({ tipoBusqueda: 4, valorBusqueda: 'BOB383' });

    expect(response.statusCode).toBe(200);
    // Comprobamos que el campo errorMessage capture el error
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.errorMessage).not.toBeNull();
  });

  it('Mercancías - Consulta en línea y valida body JSON', async () => {
    const response = await request(app.getHttpServer())
      .get('/mercancias/consultar')
      .query({ tipoBusqueda: 4, valorBusqueda: 'AAK744' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data.codigoRazonSocial');
    expect(response.body).toHaveProperty('data.razonSocial');
    expect(response.body).toHaveProperty('data.ruc');
    expect(response.body).toHaveProperty('data.direccion');
    expect(response.body).toHaveProperty('data.telefonos');
    expect(response.body).toHaveProperty('data.ciudadInscripcion');
    expect(response.body).toHaveProperty('data.tipoPersoneria');
    expect(response.body).toHaveProperty('data.modalidadEmpresa');
    expect(response.body).toHaveProperty('data.estado');
    expect(response.body).toHaveProperty('data.vigenteHasta');
    expect(response.body).toHaveProperty('data.cantidadResultados');
    expect(response.body).toHaveProperty('logMessages');
  }, 15000);

  it('Mercancias - Captura error al buscar placa no registrada', async () => {
    // Enviando un request con parámetros incompletos
    const response = await request(app.getHttpServer())
      .get('/mercancias/consultar')
      .query({ tipoBusqueda: 4, valorBusqueda: 'BOB383' });

    expect(response.statusCode).toBe(200);
    // Comprobamos que el campo errorMessage capture el error
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.errorMessage).not.toBeNull();
  });
});
