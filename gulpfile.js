var gulp = require('gulp');
var  uglify = require('gulp-uglify');
var  concat = require('gulp-concat');
var  es = require('event-stream');
var tsc = require('gulp-typescript');
var rename = require('gulp-rename');
var order = require("gulp-order");



gulp.task('ts_ang',function(){
    var dist_file= "indexeddb.angular.js";
	var folder  = gulp.src('tsAngular/**/*.ts');
	
	return es.
	merge(folder)
	.pipe(tsc())	
	.pipe(concat(dist_file))
	.pipe(gulp.dest('dist'))
	.pipe(uglify())
	.pipe(rename({ extname: '.min.js' }))	
	.pipe(gulp.dest('dist'))		
	;
});

gulp.task('ts_js',function(){
    var dist_file= "indexeddb.js";
	var folder  = gulp.src('tsJavascript/**/*.ts');
	
	return es.
	merge(folder)
	.pipe(tsc())	
	.pipe(concat(dist_file))
	.pipe(gulp.dest('dist'))
	.pipe(uglify())
	.pipe(rename({ extname: '.min.js' }))	
	.pipe(gulp.dest('dist'))		
	;
});



gulp.task('watch',function(){
	gulp.watch(['tsAngular/**/*.ts'],['ts_ang']);		
	gulp.watch(['tsJavascript/**/*.ts'],['ts_js']);		
	// gulp.watch(['ts1/*.ts','ts2/*.ts'],['ts']);	
	// gulp.watch(['sass/**/*.scss', 'layouts/**/*.css'], ['css']);

});





//Below is original file

// var gulp = require('gulp');
// var  uglify = require('gulp-uglify');
// var  concat = require('gulp-concat');
// var  es = require('event-stream');
// var tsc = require('gulp-typescript');
// var rename = require('gulp-rename');
// var order = require("gulp-order");


// var dist_file= "app.js";

// gulp.task('ts',function(){
// 	var folder0  = gulp.src('ts/ts0/*.ts');
// 	var folder1  = gulp.src('ts/ts1/*.ts');
// 	var folder2  = gulp.src('ts/ts2/*.ts');
	
// 	return es.
// 	merge(folder0,folder1, folder2)
// 	.pipe(tsc())	
// 	.pipe(concat(dist_file))
// 	.pipe(gulp.dest('dist'))
// 	.pipe(uglify())
// 	.pipe(rename({ extname: '.min.js' }))	
// 	.pipe(gulp.dest('dist'))		
// 	;
// });

// gulp.task('watch',function(){
// 	gulp.watch(['ts/**/*.ts'],['ts']);		
// 	// gulp.watch(['ts1/*.ts','ts2/*.ts'],['ts']);	
// 	// gulp.watch(['sass/**/*.scss', 'layouts/**/*.css'], ['css']);

// });