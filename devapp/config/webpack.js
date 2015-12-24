const webpack = require("webpack");

module.exports = {
    context : __dirname + "/../static/scripts/",

    output : {
        path : __dirname + "/../.tmp/scripts/",
        filename : "[name].js",
    },

    devtool : "inline-source-map",

    resolve : {
        root : [
            (__dirname + "/../static/scripts/"),
        ],

        extensions : [
            "",
            ".js",
        ],

        modulesDirectories  : [
            "node_modules",
        ],

        alias : {
            "views" : __dirname + "/../views/",
        },

        module : {
            loaders : [

            ],
        },
    },


    plugins : [
        new webpack.ResolverPlugin([
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"]),
        ]),
    ]
};
