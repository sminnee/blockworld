var gulp = require('gulp');  
var browserify = require('gulp-browserify');  
var concat = require('gulp-concat');  
//var styl = require('gulp-styl');  
var refresh = require('gulp-livereload');  
var lr = require('tiny-lr');  
var bower = require('gulp-bower');

var server = lr();

var debug = true;

gulp.task('scripts', function() {  
  gulp.src(['src/client/blockworld.js'])
    .pipe(browserify({ debug: debug }))
    .pipe(gulp.dest('dist'))
    .pipe(refresh(server))
})

gulp.task('bower', function() {
  bower()
    .pipe(gulp.dest('bower_components/'))
});

//gulp.task('styles', function() {  
//   gulp.src(['css/**/*.css'])
//     .pipe(styl({compress : true}))
//     .pipe(gulp.dest('build'))
//     .pipe(refresh(server))
// })

gulp.task('lr-server', function() {  
  server.listen(35729, function(err) {
    if(err) return console.log(err);
  });
})

gulp.task('deploy', function() {
  debug = false;
  gulp.run('bower');
  gulp.run('scripts');
})

gulp.task('default', function() {  
  gulp.run('lr-server', 'scripts'/*, 'styles'*/);

  gulp.watch('src/**', function(event) {
    gulp.run('scripts');
  })

  //gulp.watch('css/**', function(event) {
  //  gulp.run('styles');
  //})
})