var conf = require('../gulpconf');
var gulp = require('gulp');

gulp.task('watch', [
		'sass',
		'copy',
		'image-min',
		'css-min',
		'js-min',
		'css-normalize'
	],
	function () {
	var scssGlob = conf.paths.srcDir + '/**/*.scss';
	var htmlGlob = conf.paths.srcDir + '/**/*.html';
	var jsGlob = conf.paths.srcDir + '/**/*.js';

	var watchers = [];
	watchers.push( gulp.watch(htmlGlob, ['copy']) );
	watchers.push( gulp.watch(jsGlob, ['js-min']) );
	watchers.push( gulp.watch(scssGlob, ['css-normalize']) );

	watchers.forEach(function ( watch, index ) {
		watch.on('change', function (event) {
			console.log('WATCH: ' + event.path + ' was ' + event.type);
		});
	});
});