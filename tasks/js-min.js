const conf = require('../gulpconf');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('js-min', ['copy'], () => {
	var srcGlob = [
		`${conf.paths.destDir}/**/*.js`,
		`!${conf.paths.destDir}/**/*.min.js`
	];

	gulp.src( srcGlob )
		.pipe( plumber({
			errorHandler: notify.onError('Error: <%= error.message %>')
		}) )
		.pipe( sourcemaps.init() )
		.pipe( uglify({
			preserveComments: 'some' // ! から始まるコメントを残すオプションを追加
		}) )
		.pipe( rename({
			extname: '.min.js'
		}) )
		.pipe( sourcemaps.write('./', { sourceRoot: 'SORUCE_DIR' }) )
		.pipe( gulp.dest( conf.paths.destDir ) )
});
