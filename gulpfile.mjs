import gulp from 'gulp';
import webp from 'gulp-webp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass'; // 修正されたインポート方法
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssSorter from 'css-declaration-sorter';
import mmq from 'gulp-merge-media-queries';
import browserSync from 'browser-sync';
import cleanCss from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import htmlBeautify from 'gulp-html-beautify';

// gulp-sass を sass モジュールと一緒に設定
const sassCompiler = gulpSass(sass);

// タスクの定義
export function test(done) {
  console.log("Hello Gulp");
  done();
}

export function compileSass() {
  return gulp
    .src("./src/assets/sass/**/*.scss")
    .pipe(sassCompiler())
    .pipe(postcss([autoprefixer(), cssSorter()]))
    .pipe(mmq())
    .pipe(gulp.dest("./public/assets/css/"))
    .pipe(cleanCss())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./public/assets/css/"));
}

export function watch() {
  gulp.watch(
    "./src/assets/sass/**/*.scss",
    gulp.series(compileSass, browserReload)
  );
  gulp.watch("./src/assets/js/**/*.js", gulp.series(minJS, browserReload));
}

export function browserInit(done) {
  browserSync.init({
    server: {
      baseDir: "./public/",
    },
  });
  done();
}

export function browserReload(done) {
  browserSync.reload();
  done();
}

export function minJS() {
  return gulp
    .src("./src/assets/js/**/*.js")
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./public/assets/js/"));
}

export function formatHTML() {
  return gulp
    .src("./src/**/*.html")
    .pipe(
      htmlBeautify({
        indent_size: 2,
        indent_with_tabs: true,
      })
    )
    .pipe(gulp.dest("./public"));
}

export const defaultTask = () => {
  return gulp.src('./src/assets/img/**/*.{jpg,jpeg,png}')
    .pipe(rename(function(path) {
      path.basename += path.extname;
    }))
    .pipe(webp({
      quality: 70,
      method: 6,
    }))
    .pipe(gulp.dest('./public/assets/img/'));
};

// デフォルトタスクのエクスポート
export default gulp.series(
  defaultTask,
  gulp.parallel(compileSass, minJS, formatHTML)
);

// 開発用タスクのエクスポート
export const dev = gulp.parallel(browserInit, watch);
