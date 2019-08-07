const merge = require("webpack-merge")
const path = require("path")
const {DefinePlugin, ProvidePlugin} = require("webpack")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const IgnoreWarningsPlugin = require("../extensions/ignore-warnings-plugin")
const CollectMessagesPlugin = require("../extensions/collect-messages-plugin")

const mobileAssets = require("../modules/mobileAssets")
const scripts = require("../modules/scripts")
const messages = require("../modules/messages")

module.exports = function (options) {
    return merge(
        {
            context: options.frontDir,
            output: {
                filename: `index.${options.platform}.bundle`
            },
            resolveLoader: {
                alias: {
                    "svg-inline": "svg-inline-loader",
                    "extract-globalize-formatters-loader": require.resolve("../extensions/extract-globalize-formatters-loader")
                }
            },
            resolve: {
                extensions: [
                    '.ts',
                    '.tsx',
                    `.${options.platform}.ts`,
                    '.native.ts',
                    `.${options.platform}.tsx`,
                    '.native.tsx',
                ],
                alias: {
                    "mobile":  path.join(options.srcDir, "mobile"),
                    "src":  path.join(options.srcDir, "web")
                },
            },
            plugins: [
                new IgnoreWarningsPlugin({
                    patterns: [
                        /export '.*'( \((reex|im)ported as '.*'\))? was not found in/,
                        "Conflicting order between"
                    ]
                }),
                new DefinePlugin({
                    "process.env.REACT_NATIVE": true,
                }),
                new ProvidePlugin({
                    "Promise": "bluebird",
                }),
            ],
            stats: {
                children: false,
            }
        },
        mobileAssets(options),
        scripts(options),
        messages(options)
    )
}