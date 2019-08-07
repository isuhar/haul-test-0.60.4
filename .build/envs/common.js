const path = require("path")
const {ProvidePlugin, DefinePlugin} = require("webpack")
const merge = require("webpack-merge")
const IgnoreWarningsPlugin = require("../extensions/ignore-warnings-plugin")
const {filterEmpty} = require("../utils")
const scripts = require("../modules/scripts")
const styles = require("../modules/styles")
const resources = require("../modules/resources")
const messages = require("../modules/messages")

module.exports = function (options) {
    return merge(
        {
            context: options.frontDir,
            entry: filterEmpty([
                "src/bootstrap",
                options.help ? "src/index-help" : "src/index",
                options.isDevMode && "src/index-dev",
                "src/initializeKernel"
            ]),
            output: {
                path: path.join(options.buildDir, "spa"),
                filename: "[name].[chunkhash].js",
                publicPath: options.publicPath,
            },
            resolve: {
                extensions: [".js", ".ts", ".tsx"],
                alias: {
                    src: path.join(options.srcDir, "web"),
                    doc: options.docDir,
                },
            },
            resolveLoader: {
                alias: {
                    "extract-globalize-formatters-loader": require.resolve("../extensions/extract-globalize-formatters-loader"),
                    "svg-inline": "svg-inline-loader",
                    "url-loader": require.resolve("url-loader") + "?limit=" + options.inlineFileLimit,
                    "same-origin-loader": require.resolve("../extensions/same-origin-loader")
                }
            },
            mode: "development",
            externals: {
                bluebird: 'Promise',
            },
            stats: {
                children: false,
            },
            optimization: {
                runtimeChunk: "multiple",
                splitChunks: {
                    "chunks": "all"
                },
            },
            performance: {
                hints: false
            },
            plugins: [
                new IgnoreWarningsPlugin({
                    patterns: [
                        /export '.*'( \((reex|im)ported as '.*'\))? was not found in/,
                        "Conflicting order between"
                    ]
                }),
                new DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify(options.nodeEnv),
                    'process.env.APP_NAME': JSON.stringify(options.appName),
                    'process.env.TEST': JSON.stringify(options.test),
                    'process.env.MEGAPLAN_BROWSER_TEST': JSON.stringify(options.browserTest),
                    'process.env.MEGAPLAN_VERSION': JSON.stringify(options.megaplanVersion),
                    'process.env.REACT_NATIVE': false,
                }),
                new ProvidePlugin({
                    "Promise": "bluebird",
                    "window.Promise": "bluebird",
                }),
            ]
        },
        scripts(options),
        styles(options),
        resources(options),
        messages(options),
    )
}