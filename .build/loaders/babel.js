const path = require("path")

const webConfig = "web.babel.config.js"
const mobileConfig = "mobile.babel.config.js"

module.exports = function (options) {
    return {
        loader: "babel-loader",
        options: {
            babelrc: false,
            configFile: path.join(
                options.frontDir,
                ".build",
                "babel",
                options.mobile ? mobileConfig : webConfig
            ),
        }
    }
}