var conf = require('../gulpconf');
var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: conf.paths.destDir
		},
		ghostMode: {
			location: true
		}
	});
});
