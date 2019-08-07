const path = require("path")
const HtmlWebPackPlugin = require("html-webpack-plugin")


module.exports = function (options) {
    if (!options.help) {
        return {}
    }

    return {
        output: {
            path: path.join(options.buildDir, "help", "spa"),
            filename: "[name].[chunkhash].js",
            publicPath: options.publicPath,
        },
        plugins: [
            new HtmlWebPackPlugin({
                template: path.join(options.srcDir, "web", "bums", "help", "static", "index.html"),
                filename: path.join(options.buildDir, "help", "index.html"),
                minify: {
                    removeScriptTypeAttributes: true,
                },
            }),
        ],
        externals: {},
    }
}