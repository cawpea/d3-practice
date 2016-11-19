const conf = require('../gulpconf');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('css-normalize', ['css-min'], () => {
	var srcGlob = conf.paths.destDir + '/**/*.css';
	var destGlob = conf.paths.destDir;

	return gulp.src( srcGlob )
		.pipe( autoprefixer({
			browsers: ['last 5 versions'],
			cascade: false
		}) )
		.pipe( gulp.dest( destGlob ) );
});