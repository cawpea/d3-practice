var conf = require('../gulpconf');
var gulp = require('gulp');
var webserver = require('gulp-webserver');

gulp.task('serve', function () {
	gulp.src( conf.paths.destDir )
		.pipe(webserver({
			livereload: true
		}));
});