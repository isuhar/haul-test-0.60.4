const path = require("path")
const {sync} = require("glob")
const {NormalModuleReplacementPlugin} = require("webpack")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const {filterEmpty} = require("../utils")

function getlodashModules(options) {
    return sync(path.join(options.frontDir, "node_modules", "lodash", "*.js")).reduce(
        (acc, module) => {
            const baseName = path.parse(module).name
            acc[baseName.toLocaleLowerCase()] = baseName
            return acc
        },
        {}
    )
}


module.exports = function (options) {
    if (options.test) {
        return {}
    }

    lodashModules = getlodashModules(options)

    return {
        plugins: filterEmpty([
            new NormalModuleReplacementPlugin(/^lodash\.\w+$/, function(resource) {
                const moduleKey = resource.request.match(/\w+$/)[0]
                if (void 0 !== lodashModules[moduleKey]) {
                    resource.request = "lodash/" + lodashModules[moduleKey]
                }
            }),
            new HtmlWebPackPlugin({
                filename: "assets.html",
                template: path.join(__dirname, "..", "assets.html"),
                inject: true,
                inlineSource: 'runtime.*\\.js$',
            }),
            new HtmlWebpackInlineSourcePlugin(),
            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: 'async'
            }),
            !!options.analyzeReportBaseName &&
                new BundleAnalyzerPlugin({
                    openAnalyzer: false,
                    generateStatsFile: options.analyzeReportStats,
                    analyzerMode: "static",
                    reportFilename: options.analyzeReportBaseName + '.html',
                    statsFilename: options.analyzeReportBaseName + '.json',
                    statsOptions: {
                        source: false
                    }
                })
        ])
    }
}