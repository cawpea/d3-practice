var conf = require('../gulpconf');
var gulp = require('gulp');
var browserSync = require('browser-sync');
// var del = require('del');
// var wait = require('gulp-wait');
// var vinylPaths = require('vinyl-paths');

gulp.task('copy', function () {
	var srcGlob = [
		conf.paths.srcDir + '/*.html',
		conf.paths.srcDir + '/**/*.js'
	];
	var destGlob = conf.paths.destDir;

	gulp.src(srcGlob)
		.pipe(gulp.dest(destGlob))
		.pipe(browserSync.reload({stream: true}));

  gulp.src( conf.paths.srcDir + '/data/*' )
    .pipe(gulp.dest( conf.paths.destDir + '/data/' ))
});

// gulp.task('copy:tmp', function () {
// 	var srcGlob = paths.destDir + '/**/*';
// 	var destGlob = 'tmp';

// 	return gulp.src( srcGlob )
// 		.pipe( gulp.dest( destGlob ) );
// });

// gulp.task('del', ['copy:tmp'], function () {
// 	var srcGlob = 'tmp';
// 	var delay = 5000;

// 	gulp.src( srcGlob )
// 		.pipe( wait( delay ) )
// 		.pipe( vinylPaths( del ) );
// });