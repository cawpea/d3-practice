const conf = require('../gulpconf');
const gulp = require('gulp');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');

gulp.task('css-min', ['sass'], () => {
	var cssGlob = [
		`${conf.paths.destDir}/**/*.css`,
		`!${conf.paths.destDir}/**/*.min.css`
	];

	return gulp.src( cssGlob )
		.pipe( cleanCss() )
		.pipe( rename({
			extname: '.min.css'
		}) )
		.pipe( gulp.dest( conf.paths.destDir ) );
});