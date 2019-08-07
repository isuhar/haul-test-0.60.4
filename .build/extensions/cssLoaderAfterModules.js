const postcssPrependClassPlugin = require("./postcss-prepend-class-plugin");
const autoprefixer = require("autoprefixer");

/**
 * Эта функция запускается из css-loader сразу после обработки cssModules
 * @param pipeline
 */
module.exports = function(pipeline) {
    pipeline.use(autoprefixer)
    pipeline.use(postcssPrependClassPlugin({className: "#megaReact ._sc"}))
}
