module.exports = function (options) {
    return {
        loader: "thread-loader",
        options: {
            workers: options.workersCount,
            poolRespawn: false,
        },
    }
}
