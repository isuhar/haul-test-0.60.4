const merge = require("webpack-merge")
const beforeBuild = require("./hooks/beforeBuild")
const common = require("./envs/common")
const basePlugins = require("./envs/basePlugins")
const dev = require("./envs/dev")
const prod = require("./envs/prod")
const test = require("./envs/test")
const help = require("./envs/help")
const mobile = require("./envs/mobile")

const strategyMerge = merge.strategy({
    entry: "replace",
    output: "replace",
    externals: "replace"
})

module.exports = function(options) {
    if (!!options.mobile) {
        return mobile(options)
    }

    const config = strategyMerge(
        common(options),
        basePlugins(options),
        dev(options),
        prod(options),
        test(options),
        help(options),
    )

    beforeBuild(options, config)

    return config
}