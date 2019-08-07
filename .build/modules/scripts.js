const path = require("path")
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const {filterEmpty} = require("../utils")
const cacheLoader = require("../loaders/cache")
const threadLoader = require("../loaders/thread")
const babelLoader = require("../loaders/babel")
const typescriptLoader = require("../loaders/typescript")

module.exports = function(options) {
    return {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: options.srcDir,
                    exclude: "/node_modules/",
                    use: filterEmpty([
                        cacheLoader(options),
                        threadLoader(options),
                        babelLoader(options),
                        typescriptLoader(options)
                    ])
                },
            ],

            noParse: filterEmpty([
                ...(!options.mobile
                    ? [
                        new RegExp("react/dist/react(\\.min)?\\.js$"),
                        new RegExp("react\\-dom/dist/react\\-dom(\\.min)?\\.js$"),
                        new RegExp("babel\\-polyfill/dist/polyfill(\\.min)?\\.js$"),
                        new RegExp("redux/dist/redux(\\.min)?\\.js$"),
                        new RegExp("react\\-redux/dist/react\\-redux(\\.min)?\\.js$"),
                        new RegExp("localforage/dist/localforage\\.js$"),
                    ]
                    : []
                ),
                new RegExp("google-libphonenumber/dist/browser/libphonenumber\\.js$"),
            ])
        },
        plugins: filterEmpty([
            !options.test && new ForkTsCheckerWebpackPlugin({
                checkSyntacticErrors: true,
                async: options.isDevMode,
                tslint: path.join(options.frontDir, 'tslint.mobile.json'),
                useTypescriptIncrementalApi: true,
            }),
        ])
    }
}