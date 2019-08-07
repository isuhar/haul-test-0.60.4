const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = function (options) {
    return options.isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader
}