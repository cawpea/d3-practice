var conf = require('../gulpconf');
var gulp = require('gulp');
var babel = require('gulp-babel');
var cache = require('gulp-cached');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');

gulp.task('babel', function() {
  var srcGlob = [
    conf.paths.srcDir + '/**/*.js',
  ];

  gulp.src( srcGlob )
    .pipe(cache('babel'))
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe( babel({
      presets: ['es2015']
    }) )
    .pipe( gulp.dest( conf.paths.destDir ) );
});