const {NormalModuleReplacementPlugin} = require("webpack")
const path = require("path")
const {readdirSync} = require("fs")
const os = require("os")
const tsm = require('teamcity-service-messages')
const noopPath = require.resolve("../extensions/noop.js")
const {filterEmpty} = require("../utils")

module.exports = function(options) {
    if (!options.test) {
        return {}
    }

    return {
        target: "node",
        entry: [
            "src/sourceMapSupportNode",
            "src/bootstrap",
            "src/setupJsDOM",
            "src/all-tests",
        ],
        output: {
            path: path.join(options.frontDir, "megatest"),
            filename: "megatest.js",
            devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        },
        optimization: {
            runtimeChunk: false,
            splitChunks: false,
            minimize: false,
        },
        plugins: filterEmpty([
            new NormalModuleReplacementPlugin(/\.(styl|css|png|ico|jpg|woff*)$/, noopPath),
            !options.testRealTime && function () {
                const spawn = require('child_process').spawn;
                return this.plugin("after-emit", (compilation, callback) => {
                    const watch = compilation.compiler.options.watch

                    const mochaArgs = [
                        compilation.assets["megatest.js"].existsAt,
                        "--exit"
                    ];
                    if (options.teamcity) {
                        mochaArgs.push(
                            "--reporter",
                            "mocha-teamcity-reporter"
                        );
                    }
                    if (options.gitlab) {
                        mochaArgs.push(
                            "--reporter",
                            "mocha-junit-reporter"
                        );
                    }
                    const mochaPath = os.platform() === "win32" ? ".\\node_modules\\.bin\\mocha.cmd" : "node_modules/.bin/mocha"
                    const mocha = spawn(
                        mochaPath,
                        mochaArgs,
                        {
                            stdio: "inherit"
                        }
                    )
                    mocha.on("close", (code) => {
                        if (options.teamcity) {
                            tsm.testStarted({name: "mocha.finalization"})
                            if (0 !== code) {
                                tsm.testFailed({name: "mocha.finalization", message: "mocha finished with code " + code})
                            }
                            tsm.testFinished({name: "mocha.finalization"})
                        }
                        if (!watch && 0 !== code) {
                            process.exitCode = code
                        }
                        callback();
                    })
                })
            },
        ]),
        externals: readdirSync("node_modules").reduce((externals, module) => {
            return Object.assign(externals, {[module]: "commonjs " + module})
        }, {})
    }
}