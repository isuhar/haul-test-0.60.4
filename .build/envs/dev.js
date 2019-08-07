module.exports = function(options) {
    if (!options.development || options.help) {
        return {}
    }

    return {
        watch: true,
        optimization: {
            minimize: false,
        },
        devtool: "cheap-module-source-map"
    }
}