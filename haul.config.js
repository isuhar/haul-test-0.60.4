const merge = require("webpack-merge")
const {HotModuleReplacementPlugin, SourceMapDevToolPlugin} = require("webpack")
import {makeConfig, withPolyfills} from "@haul-bundler/preset-0.60"

const yargs = require("yargs")
const beforeStart = require("./.build/hooks/beforeStart")
const makeOptions = require("./.build/makeOptions")
const {spliceFilter} = require("./.build/utils")
const resolver = require("./.build/resolver")


const argv = yargs.argv

beforeStart(argv)

export default makeConfig({
    bundles: {
        index: {
            entry: withPolyfills("./src/mobile/index"),
            transform({ bundleName, env, runtime, config }) {
                runtime.logger.info(`Altering Webpack config for bundle ${bundleName}`)

                const options = makeOptions(Object.assign({}, argv.env, argv, {mobile: true}, env, {prod: !env.dev}))
                options.runtime = runtime

                if (env.dev) {
                    spliceFilter(config.entry, entry => entry.indexOf("hot/patch.js") !== -1)
                    spliceFilter(config.plugins, plugin => plugin instanceof HotModuleReplacementPlugin)
                    config.resolve.alias = {}
                } else {
                    spliceFilter(config.plugins, plugin => plugin instanceof SourceMapDevToolPlugin)
                }

                return merge.strategy({
                    "module.rules": "replace",
                    "stats": "replace"
                })(
                    config,
                    resolver(options)
                )
            },
        },
    },
})
