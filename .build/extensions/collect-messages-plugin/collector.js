"use strict";

const Promise = require("bluebird")
const glob = Promise.promisify(require("glob"))
const fs = Promise.promisifyAll(require("fs"))
const path = require("path")
const yaml = require("js-yaml")
const processMessages = require("../intl-messages-loader/processMessages")
const Immutable = require("immutable")
const _ = require("lodash")

/**
 * Данный плагин собирает все фразы для перевода по файлам messages.yml
 * и раскладывает их по файлам [locale].json.
 * Если фраза новая, то она кладётся во все локали.
 * Если фраза уже существует в ru.json, то она пропускается.
 * Если фраза существует в ru.json и она отличается, то оригинальная фраза перезаписывает все существующие переводы.
 * @constructor
 */
function Collector() {
    this.filesStat = {}
    this.failOnEmit = false
}

const srcDir = path.join(process.cwd(), "src")
const messagesGlobPattern = path.join(process.cwd(), "src", "**", "*messages.yml")
const messagesTargetDir = path.join(process.cwd(), "_translations")

// add language here if needed
const langs = ["az", "cs", "de", "en", "fr", "id", "kk", "ru", "uk", "vi", "be", "tr"]
const langFiles = new Map()
for (let langName of langs) {
    langFiles.set(langName, path.join(messagesTargetDir, `${langName}.json`))
}

function multiliner(source) {
    if (Array.isArray(source)) {
        return source
    }
    let arr = source.split("\n")
    if (arr.length === 1) {
        return source
    } else {
        return arr
    }
}

function joiner(source) {
    if (Array.isArray(source)) {
        return source.join("\n");
    }
    if (typeof source === "object") {
        const result = {}
        Object.keys(source).forEach(key => {
            result[key] = joiner(source[key])
        })
        return result;
    }
    return source;
}

Collector.prototype.collect = function() {
    return glob(messagesGlobPattern)
        .then(files => Promise.all(files.map(f => fs.statAsync(f))).then(stats => {
            const currentFStat = {}
            for (let i = 0, count = stats.length; i < count; ++i) {
                currentFStat[files[i]] = stats[i].mtime.getTime()
            }
            if (_.isEqual(this.filesStat, currentFStat)) {
                throw Object.assign(new Error(), {code: "BREAK"})
            }
            this.filesStat = currentFStat
            return files
        }))
        .then(files => files.map(file => fs.readFileAsync(file).then(content => [file, content])))
        .then(Promise.all)
        .then(files => {
            const ruMessages = {}
            const existIds = []
            for (let tuple of files) {
                let file = tuple[0];
                let fileContent = tuple[1];
                const fileMessages = processMessages(yaml.safeLoad(fileContent))
                Object.keys(fileMessages).forEach(fileKey => {
                    const descriptor = fileMessages[fileKey];
                    const messageId = descriptor.id;
                    if (!ruMessages[messageId]) {
                        existIds.push(messageId)
                        ruMessages[messageId] = {
                            id: messageId,
                            description: descriptor.description,
                            message: descriptor.defaultMessage.trim(),
                            __file: path.relative(srcDir, file)
                        }
                    } else {
                        throw new Error(
                            `Message with key "${messageId}" already defined in file "${ruMessages[messageId].__file}"`
                        )
                    }
                })
            }
            existIds.sort();

            return Promise.resolve(langFiles)
                .then(langFiles => {
                    const promises = [];
                    const result = new Map()
                    langFiles.forEach((fileName, langName) => {
                        const promise = fs.statAsync(fileName)
                            .then(() => fs.readFileAsync(fileName).then(JSON.parse).then(joiner))
                            .catch((e) => {
                                throw new Error(`Error while reading or parsing file ${langName}.json\n${e.toString()}`)
                            })
                            .then(existsMessages => result.set(langName, existsMessages))
                        promises.push(promise)
                    })
                    return Promise.all(promises).then(() => result)
                })
                .then(existsMessages => {
                    // Сначала обработка ru.json. Надо запомнить, что изменилось.
                    const changedIds = {};
                    const deletedIds = {};
                    const changedLanguages = {};
                    const newFileContents = new Map();
                    const existRuMessages = existsMessages.get("ru");
                    Object.keys(existRuMessages).forEach(existsMessageId => {
                        const existsMessage = existRuMessages[existsMessageId]
                        if (ruMessages[existsMessageId]) {
                            const currentMessage = ruMessages[existsMessageId].message
                            if (existsMessage.replace(/w+/,"") !== currentMessage.replace(/w+/,"")) {
                                changedIds[existsMessageId] = true
                                changedLanguages.ru = true;
                            }
                        } else {
                            deletedIds[existsMessageId] = true
                            changedLanguages.ru = true;
                        }
                    })
                    if (Object.keys(existRuMessages).length !== Object.keys(ruMessages).length) {
                        changedLanguages.ru = true;
                    }
                    let fileMessages = Immutable.OrderedMap()
                    for (let messageId of existIds) {
                        fileMessages = fileMessages.set(messageId, multiliner(ruMessages[messageId].message))
                    }

                    newFileContents.set("ru", fileMessages)
                    // Теперь всё остально кроме "ru"

                    existsMessages.forEach((fileMessages, langName) => {
                        if ("ru" !== langName) {
                            let newFileMessages = Immutable.OrderedMap()
                            for (let messageId of existIds) {
                                // определяем откуда брать сообщение - либо оставляем оригинальное, либо
                                // берём из ruMessages
                                let message
                                if (fileMessages[messageId] && !changedIds[messageId]) {
                                    message = fileMessages[messageId]
                                } else {
                                    message = ruMessages[messageId].message
                                    changedLanguages[langName] = true;
                                }
                                newFileMessages = newFileMessages.set(messageId, multiliner(message))
                            }
                            if (Object.keys(fileMessages).length !== newFileMessages.size) {
                                changedLanguages[langName] = true;
                            }
                            newFileContents.set(langName, newFileMessages)
                        }

                    })
                    const writePromises = [];
                    newFileContents.forEach((fileMessages, langName) => {
                        if (changedLanguages[langName]) {
                            if (this.failOnEmit) {
                                throw new Error("Languages should not be changed now!")
                            }
                            console.log(langName, 'written')
                            writePromises.push(
                                fs.writeFileAsync(
                                    langFiles.get(langName),
                                    JSON.stringify(fileMessages, null, "  "),
                                    "utf8"
                                )
                            )
                        }
                    })
                    return Promise.all(writePromises)
                })
        })
        .catch({code: "BREAK"}, () => void 0)
}
module.exports = Collector
