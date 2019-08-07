const {filterEmpty} = require("../utils")
const styleLoader = require("../loaders/style")
const cacheLoader = require("../loaders/cache")
const threadLoader = require("../loaders/thread")

module.exports = function (options) {
    return {
        module: {
            rules: [
                /** Stylus файлы */
                {
                    test: /\.styl$/,
                    include: options.srcDir,
                    use: filterEmpty([
                        styleLoader(options),
                        cacheLoader(options),
                        threadLoader(options),
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: options.isDevMode,
                                modules: true,
                                afterModules: require.resolve("../extensions/cssLoaderAfterModules"),
                                importLoaders: 1,
                                localIdentName: options.isDevMode ? '[path][name]---[local]---[hash:base64:5]' : null,
                                context: options.srcDir,
                                minimize: !options.isDevMode
                            }
                        },
                        {
                            loader: require.resolve("../extensions/nibbedStylus"),
                            options: {
                                import: ['~src/lib/components/theme/base.styl']
                            }
                        },
                    ]),
                },

                /** Обычные css файлы */
                {
                    test: /\.css$/,
                    use: filterEmpty([
                        styleLoader(options),
                        cacheLoader(options),
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: options.isDevMode,
                                afterModules: require.resolve("../extensions/cssLoaderAfterModules"),
                                minimize: !options.isDevMode
                            }
                        }
                    ]),
                },
            ]
        },
    }
}