const CollectMessagesPlugin = require("../extensions/collect-messages-plugin")

module.exports = function (options) {
    return {
        module: {
            rules: [
                {
                    test: /messages\.yml/,
                    use: [
                        "json-loader",
                        require.resolve("../extensions/intl-messages-loader"),
                        "yaml-loader"
                    ],
                },
            ]
        },
        plugins: [
            new CollectMessagesPlugin({
                prod: options.production,
            }),
        ]
    }
}
