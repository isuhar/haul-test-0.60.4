module.exports = function(api) {
    api.cache.using(() => process.env.BABEL_ENV)

    return {
        presets: [
            "module:@haul-bundler/babel-preset-react-native",
        ],
        plugins: [
            "react-require",
            "lodash",
            "./babel-plugin-typescript-lazy-metadata",
            ["@babel/plugin-transform-runtime", {
                helpers: true,
                regenerator: false,
            }],
        ],
        compact: api.env("production")
    }
}