const path = require("path")
const crypto = require("crypto")
const {HashedModuleIdsPlugin, NamedChunksPlugin} = require("webpack")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

module.exports = function (options) {
    if (!options.production) {
        return {}
    }

    return {
        mode: "production",
        devtool: "hidden-source-map",
        recordsOutputPath: path.join(options.buildDir, "spa", "records.json"),
        performance: void 0,
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                    terserOptions: {
                        sourceMap: true,
                        compress: {
                            warnings: false
                        }
                    }
                }),
                new OptimizeCSSAssetsPlugin({}),
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
              filename: "[name].[contenthash].css",
            }),
            new HashedModuleIdsPlugin({}),
            new NamedChunksPlugin(function() {
                const usedIds = new Set()
                const defaultLen = 4

                return function nameResolver(chunk) {
                    const moduleIds = chunk.getModules().map(m => m.id).sort().join(';')
                    const hash = crypto.createHash("sha256") // Like HashedModuleIdsPlugin

                    hash.update(moduleIds)

                    const hashId = hash.digest("hex")

                    let len = defaultLen
                    let resultId

                    do {
                        resultId = hashId.substr(0, len)
                        len++
                    } while (usedIds.has(resultId))

                    usedIds.add(resultId)

                    return resultId
                }
            }())
        ],
  }
}