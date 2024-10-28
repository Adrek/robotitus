<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# ROBOT SAT

REQUISITOS

- Versión utilizado para el desarrollo con Node 18 (v18.17.1)
- Versión estable de docker

LEVANTAR PROYECTO EN MODO LOCAL

1. Clonar repositorio
2. `npm install`
3. Clonar el archivo `.env.template` y renombrarlo a `.env`
4. Cambiar las variables de entorno
5. Ejecutar `npm run start:dev`

```
docker-compose up -d
```

6. (Opcional) La primera vez ejecutar el seed para cargar las tablas maestras

7. Levantar: `npm run start:dev`

<br/>

### PREPARAR ARCHIVO DE DESPLIEGUE

1. Aumentar la versión del tag en los archivos _docker-compose.yml_ y _docker-compose.prod.yml_. Ejemplo

- image: pm2-rpa-robosat-prd:1.1 --> image: pm2-rpa-robosat-prd:1.2

2. Ejecutar el comando `docker-compose build`
3. Ejecutar el comando con la nueva versión `docker save -o image_portainer.tar pm2-rpa-robosat-prd:1.2`. NOTA: cambiar el 1.2 por la misma versión establecida en el paso 1.
4. Ejecutar el comando `gulp` que generar un archivo zip dentro de la carpeta "deploy"
5. Utilizar el archivo \*.zip para desplegarlo en entornos de desarrollo, qa o producción.

<br/>

### DESPLEGAR EN DESARROLLO, QA O PRODUCCIÓN

1. Mover al archivo .zip a la carpeta según corresponda: servicios/servicio-\*\*\*\*
2. Hacer un respaldo del archivo .env en caso exista. De lo contrario, duplicar el archivo _.env.template_ para generar uno nuevo
3. Verificar que el archivo _run.sh_ cuente con los permisos 766
4. Ejecutar el el comando `sh run.sh` para desplegar
