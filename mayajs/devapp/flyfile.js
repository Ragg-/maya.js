const source = {
    scripts : "./static/scripts/*",
    views : "./views/**/*",
    styles : "./static/styles/**/*.styl",
    css : "./static/styles/**/*.css",
    fonts : "./static/fonts/**/*",
    images : "./static/images/**/*",
    html : "./static/**/*.html"
};

// Compiled assets must export to `app/.tmp/static/**`
// maya.js is point to `app/.tmp/static/` as after compiled static content root.
const dest = {
    scripts : "./.tmp/static/scripts/",
    styles : "./.tmp/static/styles/",
    // css : "./.tmp/static/styles/",
    fonts : "./.tmp/static/fonts/",
    images : "./.tmp/static/images/",
    html : "./.tmp/static/"
}

//
// Entry tasks
//

export async function devel() {
    await this.watch([source.scripts, source.views], ["buildScripts"]);
    await this.watch([source.styles, source.css], ["buildStyles"]);
    await this.watch([source.fonts], ["copyFonts"]);
    await this.watch([source.images], ["copyImages"]);
    await this.watch([source.html], ["copyHtml"]);
};

export async function production() {
    await this.start(["buildScripts", "buildStyles", "copyFonts", "copyImages", "copyHtml"] , {
        parallel : true
    });
}

//
// Build || Copy tasks below.
//

export async function buildScripts() {
    // exports path defined on `./config/webpack.js`
    await this.clear(dest.scripts);

    await this.source(source.scripts)
        .webpack(require("./config/webpack.js"));

    // if you not want to use webpack.
    // comment out or remove above `await this.source` to next lines `);` code.
    // and rescission comment out bellow code.

    // await this.source(`${source.scripts}*/*`)
    //     .target(dest.scripts);
}

export async function buildStyles() {
    await this.clear(dest.styles);

    await this.source(source.styles)
        .stylus(require("./config/stylus.js"))
        .target(dest.styles);

    await this.source(source.css)
        .target(dest.styles);
}

export async function copyFonts() {
    await this.clear(dest.fonts);

    await this.source(source.fonts)
        .target(dest.fonts);
}

export async function copyImages() {
    await this.clear(dest.images);

    await this.source(source.images)
        .target(dest.images);
}

export async function copyHtml() {
    await this.clear(`${dest.html}**/*.html`);
    await this.source(source.html)
        .target(dest.html);
}
