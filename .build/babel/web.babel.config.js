const {filterEmpty} = require("../utils")

const makeEnv = function (options) {
    return {
        modules: false,
        useBuiltIns: "entry",
        debug: false,
        ...options,
    }
}

module.exports = function(api) {
    api.cache.using(() => process.env.BABEL_ENV)

    return {
        presets: filterEmpty([
            ["@babel/preset-react", {
                pragma: "dom",
                pragmaFrag: "DomFrag",
                throwIfNamespace: false,
                development: api.env("development")
            }],
            api.env("production") &&
                ["@babel/preset-env", makeEnv({
                    exclude: [
                        "es6.promise"
                    ]
                })],
            api.env("development") &&
                ["@babel/preset-env", makeEnv({
                    targets: {
                        esmodules: true
                    },
                    exclude: [
                        "es6.promise"
                    ]
                })],
            api.env("development-node") &&
                ["@babel/preset-env", makeEnv({
                    targets: {
                        node: "current"
                    },
                })]
        ]),
        plugins: filterEmpty([
            "@babel/plugin-syntax-dynamic-import",
            "lodash",
            ["@babel/plugin-transform-runtime", {
                regenerator: false,
                useESModules: api.env("development")
            }],
            api.env("development-node") &&
                ["espower", {
                    embedAst: true
                }],
            "./babel-plugin-typescript-lazy-metadata",
            "./babel-plugin-alias-react-create-element-to-dom",
            ...(
                api.env("production")
                    ? [
                        "./babel-plugin-add-classname-as-property",
                        "./babel-plugin-modularize-components",
                        "@babel/plugin-proposal-class-properties",
                        "@babel/plugin-transform-react-constant-elements",
                        ["transform-react-remove-prop-types", {mode: "remove"}],
                    ]
                    : []
            )
        ]),
        compact: api.env("production")
    }
}
