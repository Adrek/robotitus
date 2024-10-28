/* eslint-disable @typescript-eslint/no-var-requires */
import gulp from 'gulp';
import fs from 'fs-extra';
import zip from 'gulp-zip';

const serviceName = 'servicio-robotsat';

gulp.task('createDeploy', function () {
  return fs
    .remove(`deploy/${serviceName}`)
    .then(() => {
      return fs.ensureDir(`deploy/${serviceName}`);
    })
    .then(() => {
      return fs.copy('./deploy/run.sh', `./deploy/${serviceName}/run.sh`);
    })
    .then(() => {
      return fs.copy(
        './docker-compose.prod.yml',
        `./deploy/${serviceName}/docker-compose.prod.yml`,
      );
    })
    .then(() => {
      return fs.copy(
        './.env.template',
        `./deploy/${serviceName}/.env.template`,
      );
    })
    .then(() => {
      return fs.copy(
        './.env.template',
        `./deploy/${serviceName}/.env.template`,
      );
    })
    .then(() => {
      console.log('¡Carpeta creada y contenido movido!');
    })
    .catch((err) => {
      console.error('Hubo un error:', err);
    });
});

gulp.task('zipDeploy', function () {
  return gulp
    .src([`deploy/${serviceName}/**/*`, `deploy/${serviceName}/**/.*`])
    .pipe(zip(`${serviceName}.zip`))
    .pipe(gulp.dest('./deploy'));
});

gulp.task('default', gulp.series('createDeploy', 'zipDeploy'));
