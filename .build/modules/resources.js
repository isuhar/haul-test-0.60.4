module.exports = function (options) {
  return {
        module: {
            rules: [
                /** Изображения различных форматов **/
                {
                    test: /\.(gif|jpe?g|png|ico|svg)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: options.inlineFileLimit,
                        }
                    }],
                },

                /** Шрифты различных форматов **/
                {
                    test: /\.(woff(2)?)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: options.inlineFileLimit,
                            mimetype: 'application/font-woff'
                        }
                    }],
                },
                {
                    test: /\.(ttf|eot)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: options.inlineFileLimit,
                            mimetype: 'application/octet-stream'
                        }
                    }],
                },

                /** Для модуля bums/help */
                {
                    test: /\.md$/,
                    use: 'raw-loader'
                },
                {
                    test: /doc\/user\/.+\.yml$/,
                    use: [
                        "json-loader",
                        "yaml-loader"
                    ]
                },
            ]
        }
    }
}