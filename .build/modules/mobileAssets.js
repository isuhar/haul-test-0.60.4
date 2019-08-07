const _core = require("@haul-bundler/core")
const path = require("path")


module.exports = function (options) {
    return {
        module: {
            rules:[
                {parser: {requireEnsure: false}},
                {
                    test: /\.[jt]sx?$/,
                    // eslint-disable-next-line no-useless-escape
                    exclude: /node_modules(?!.*[\/\\](react|@react-navigation|@react-native-community|@expo|pretty-format|@haul-bundler|metro))/,
                    use: [
                        {
                            loader: require.resolve('babel-loader'),
                            options: {
                                extends: path.join(
                                    options.frontDir,
                                    ".build",
                                    "babel",
                                    "mobile.babel.config.js",
                                ),
                                plugins: [
                                    require.resolve(
                                        '@haul-bundler/core/build/utils/fixRequireIssues'
                                    ),
                                ],
                                /**
                                 * to improve the rebuild speeds
                                 * This enables caching results in ./node_modules/.cache/babel-loader/
                                 * This is a feature of `babel-loader` and not babel
                                 */
                                cacheDirectory: false,
                            },
                        },
                    ],
                },
                {
                    test: _core.AssetResolver.test,
                    use: {
                        /**
                         * Asset loader enables asset management based on image scale
                         * This needs the AssetResolver plugin in resolver.plugins to work
                         */
                        loader: _core.ASSET_LOADER_PATH,
                        options: {
                            platform: options.platform,
                            root: options.root,
                            bundle: options.bundle,
                            runtime: options.runtime,
                        }
                    }
                }
            ]
        }
    }
}
