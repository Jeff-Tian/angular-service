var
    gulp = require('gulp'),
    print = require('gulp-print'),
    runSequence = require('run-sequence'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    uglifyCss = require('gulp-minify-css')
    ;

gulp.task('build', function (done) {
    runSequence('clean', 'copy', 'uglify-js', 'uglify-css', done);
});
gulp.task('default', ['build']);

gulp.task('clean', function (done) {
    return gulp.src('dist', {read: false})
        .pipe(clean())
        ;
});

gulp.task('copy', function (done) {
    return gulp.src(['public/**/*'])
        .pipe(gulp.dest('dist/'))
        ;
});

gulp.task('uglify-js', function (done) {
    return gulp.src('public/scripts/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'))
        ;
});

gulp.task('uglify-css', function (done) {
    return gulp.src('public/stylesheets/*.css')
        .pipe(uglifyCss())
        .pipe(gulp.dest('dist/stylesheets'))
        ;
});

module.exports = function (callback) {
    runSequence('build', callback);
};