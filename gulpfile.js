const gulp = require('gulp'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber');
    sourcemaps = require('gulp-sourcemaps'),
    newer = require('gulp-newer'),
    fileinclude = require('gulp-file-include'),
    htmlhint = require("gulp-htmlhint"),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-cssmin'),
    gcmq = require('gulp-group-css-media-queries'),
    jshint = require('gulp-jshint'),
    babel = require('gulp-babel'),
    connect = require('gulp-connect'),
    minify = require('gulp-minify'),
    spritesmith = require('gulp.spritesmith-multi'),
    merge = require('merge-stream'),
    // iconfont = require('gulp-iconfont'),
    // iconfontCss = require('gulp-iconfont-css'),
    // inlineCss = require('gulp-inline-css'),
    data = require('gulp-data'),
    template = require('gulp-template'),
    sitemap = require('gulp-sitemap-generator'),
    fs = require('fs'),
    path = require('path'),
    origin = "source",
    project = "build",
    prefix = "";

require('gulp-stats')(gulp);

gulp.task('clean', () => {
    return gulp.src(`${project}`, {
            read: false
        })
        .pipe(clean());
});

gulp.task('js', () => {
    return gulp.src(`./${origin}/js/**/*.js`)
        .pipe(newer(`${origin}/js/*.js`))
        .pipe(plumber({errorHandler : gutil.log}))
        .pipe(jshint())
        .pipe(babel({
            presets: ['es2015']
        }))
        // .pipe(minify({
        //     ext: {
        //         src:'-debug.js',
        //         min: '.js'
        //     },
        //     // exclude: ['tasks'],
        //     ignoreFiles: ['-min.js']
        // }))
        .pipe(gulp.dest(`${project}${prefix}/js`))
        .pipe(connect.reload())
});

gulp.task('images', () => {
    return gulp.src([
            `${origin}/images/**/*.{gif,jpeg,jpg,png,svg}`,
            `!${origin}/images/sprite/**/*.png`,
            `!${origin}/images/svg/**/*.svg`
        ])
        .pipe(newer(`${project}/images/**/*.{gif,jpeg,jpg,png,svg}`))
        .pipe(gulp.dest(`${project}${prefix}/images`))
        .pipe(connect.reload());
});

gulp.task('sprite', () => {
    let opts = {
        spritesmith(options, sprite, icons) {
            options.imgPath = `${prefix}/images/sprite/${options.imgName}`;
            options.cssName = `${sprite}.css`;
            options.cssSpritesheetName = sprite;
            options.padding = 10;
            options.cssVarMap = (spr) => {
                spr.name = `${spr.name}`;
            };
            return options;
        }
    };
    let spriteData = gulp.src(`${origin}/images/sprite/**/*.png`).pipe(spritesmith(opts)).on('error', (err) => {
        console.log(err)
    });
    let imgStream = spriteData.img.pipe(gulp.dest(`${project}${prefix}/images/sprite`));
    let cssStream = spriteData.css
        .pipe(csscomb({
            configPath: 'hint/.csscomb.json'
        }))
        // .pipe(cssmin())
        .pipe(gulp.dest(`${project}${prefix}/css`));
    return merge(imgStream, cssStream);
});

// gulp.task('iconfont', function() {
//     return gulp.src([`${origin}/images/svg/**/*.svg`])
//         .pipe(iconfontCss({
//             fontName: `awesome`,
//             path: `${origin}/sass/_icons.css`, //css rules를 생성해줄 css 파일
//             targetPath: `../css/_icons.css`, //css가 생성되는 경로. 근데 왜 경로가 dest 기준이냐
//             fontPath: `${prefix}/fonts/` //css내에서 font의 경로를 잡아준다
//         }))
//         .pipe(iconfont({
//             fontName: `awesome`,
//             fontHeight: '1000',
//             normalize: true
//         }))
//         .pipe(gulp.dest(`${project}${prefix}/fonts`));
// });

gulp.task('html', () => {
    return gulp.src([`${origin}/**/*.html`, `!${origin}/include/*.html`,`!${origin}/map.html`])
        .pipe(newer(`${origin}/**/*.html`))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: `${origin}/include`,
            context: {
                name: 'example'
            }
        }))
        .pipe(sitemap({
            'name':`map.html`,
            'noDir': '상위',
            'dest':`${prefix}`,
            'app':`${origin}`,
            'untitle':'-',
            'unknown':'cruel32',
            'noDescription':'설명이 없어요',
            'division':'html'
        }))
        .pipe(htmlhint('hint/.htmlhintrc'))
        .pipe(data((file)=>{
            return JSON.parse(fs.readFileSync(`${origin}/json/default.json`))
        }))
        .pipe(data((file)=>{
            try {
                const ext = path.extname(file.path);
                const jsonFile = file.path.split(`${origin}\\html\\`)[1].split(ext)[0];
                return JSON.parse(fs.readFileSync(`${origin}/json/${jsonFile}.json`));
            } catch(err){
                return {}
            }
        }))
        .pipe(template())
        .pipe(gulp.dest(`${project}${prefix}`))
        .pipe(connect.reload());
});

gulp.task('css', () => {
    return gulp.src([`${origin}/sass/**/*.{scss,sass,css}`,`!${origin}/sass/mixin/*.{scss,sass}`])
        .pipe(newer(`${origin}/sass/**/*.{scss,sass,css}`))
        // .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gcmq())
        .pipe(csscomb({
            configPath: 'hint/.csscomb.json'
        }))
        /*
            *** csscomb 커스터마이징 ***
            node_modules/csscomb/lib/options/strip-spaces.js 파일에서 9 lines 수정

            수정전:
            return string.replace(/[ \t]+\n/g, '\n');
            
            수정후:
            return string.replace(/[ \t]+\n/g, '\n').replace(/\n\n/g, '\n');
        */
        .pipe(sourcemaps.write())
        // .pipe(cssmin())
        .pipe(gulp.dest(`${project}${prefix}/css`))
        .pipe(connect.reload());
});

// gulp.task('inlineCss',function(){
//     return gulp.src([`${origin}/inline/**/*.html`])
//         .pipe(newer(`${origin}/inline/**/*.html`))
//         .pipe(inlineCss({
//             applyStyleTags: true,
//             applyLinkTags: true,
//             removeStyleTags: true,
//             removeLinkTags: true
//         }))
//         .pipe(gulp.dest(`${project}${prefix}`))
//         .pipe(connect.reload());
// })

gulp.task('connect', function() {
    connect.server({
        root: `${project}`,
        port: 5000,
        livereload: true
    });
});

gulp.task('watch', () => {
    gulp.watch(`${origin}/images/**/*.{gif,jpeg,jpg,png,svg}`, ['images'])
    gulp.watch(`${origin}/images/sprite/**/*.png`, ['sprite'])
    // gulp.watch(`${origin}/images/svg/**/*.svg`, ['iconfont'])
    gulp.watch(`${origin}/js/**/*.js`, ['js']);
    gulp.watch(`${origin}/html/**/*.html`, ['html'])
    gulp.watch(`${origin}/sass/**/*.{scss,sass.css}`, ['css']);
    gulp.watch(`${origin}/json/**/*.json`, ['html']);
});

gulp.task('default', ['html', 'css', 'js', 'images', 'sprite']);
gulp.task('serve', ['connect', 'watch']);