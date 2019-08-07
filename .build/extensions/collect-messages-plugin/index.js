"use strict";

const Promise = require("bluebird")
const glob = Promise.promisify(require("glob"))
const fs = Promise.promisifyAll(require("fs"))
const path = require("path")
const yaml = require("js-yaml")
const processMessages = require("../intl-messages-loader/processMessages")
const Immutable = require("immutable")
const _ = require("lodash")
const Collector = require("./collector")

/**
 * Данный плагин собирает все фразы для перевода по файлам messages.yml
 * и раскладывает их по файлам [locale].json.
 * Если фраза новая, то она кладётся во все локали.
 * Если фраза уже существует в ru.json, то она пропускается.
 * Если фраза существует в ru.json и она отличается, то оригинальная фраза перезаписывает все существующие переводы.
 * @constructor
 */
function CollectMessagesPlugin(options) {
    this.collector = new Collector()
    this.collector.failOnEmit = options && !!options.prod
}

CollectMessagesPlugin.prototype.apply = function(compiler) {
    const self = this
    function makeHook(compilation, callback) {
        self.collector.collect().asCallback(callback)
    }
    if (compiler.hooks) {
        compiler.hooks.make.tap("CollectMessagesPlugin", makeHook)
    } else {
        compiler.plugin("make", makeHook)
    }

}

module.exports = CollectMessagesPlugin
