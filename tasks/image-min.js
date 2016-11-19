var conf = require('../gulpconf');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var changed = require('gulp-changed');

gulp.task('image-min', function () {
	var srcGlob = conf.paths.srcDir + '/**/*.+(jpg|jpeg|png|gif|svg)';
	var destGlob = conf.paths.destDir;
	var imageminOptions = {
		optimizationLevel: 7
	};

	gulp.src( srcGlob )
		.pipe(changed( destGlob ))
		.pipe(imagemin( imageminOptions ))
		.pipe(gulp.dest( destGlob ));
});