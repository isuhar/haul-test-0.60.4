const path = require("path")
const fs = require("fs")
const glob = require("glob")

function getMTimes(files) {
    return files
        .reduce((acc, file) => acc.concat(glob.sync(file)), [])
        .map(path => [path, fs.statSync(path)])
        .filter(([, stat]) => stat.isFile())
        .map(([path]) => fs.readFileSync(path, 'utf8'))
}

const commonCacheIdentifier = (options) => ({
    files: getMTimes([
        path.join(options.frontDir, '*.json'),
        path.join(options.frontDir, 'webpack.*.js'),
        path.join(options.frontDir, '.build', '**', '*'),
    ]),
    nodeEnv: options.nodeEnv,
    babelEnv: options.babelEnv,
})



module.exports = function(options) {
    if (!options.isDevMode) {
        return void 0
    }

    return {
        loader: 'cache-loader',
        options: {
            cacheDirectory: options.cacheDir,
            cacheIdentifier: require('node-object-hash')({sort: false}).hash(commonCacheIdentifier(options))
        }
    }
}