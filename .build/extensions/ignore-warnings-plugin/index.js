const ModuleDependencyWarning = require("webpack/lib/ModuleDependencyWarning")
const SyncHook = require("tapable").SyncHook

const availablePlainTypes = ["string", "function"]

/**
 * Данный плагин предназначен для исключения ворнингов типа
 * export 'ExtraFieldsStoreProps' was not found in 'src/bums/common/stores/AbstractExtraFieldsStore'
 *
 * За соответствие между импортами-экспортами модулей следит тайпскрипт, а эта ошибка вылезает если
 * typescript emitDecoratorMetadata:true и ts-loader happyPackMode: true
 */

function validatePattern(pattern) {
    return pattern instanceof RegExp || availablePlainTypes.includes(typeof pattern)
}


function checkWarnings(patterns, result) {
    result.compilation.warnings = result.compilation.warnings.filter(warning => {
        const message = warning.message || warning

        return !patterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(message)
            }

            const patternType = typeof pattern

            if (patternType === "string") {
                return message.includes(pattern)
            }

            if (patternType === "function") {
                return pattern(message)
            }

            return false
        })
    })
}

class IgnoreWarningsPlugin {
    constructor(options) {
        const patterns = options && options.patterns || void 0

        if (!Array.isArray(patterns) || !patterns.every(validatePattern)) {
            throw new Error("Patterns an only be Array<RegExp|Function|String>");
        }

        this.patterns = patterns;
    }

    apply(compiler) {
        if (compiler.hooks) {
            compiler.hooks.done.tap("ignore-warnings-plugin", result => {
                checkWarnings(this.patterns, result)
            })
        } else {
            compiler.plugin("done", result => {
                checkWarnings(this.patterns, result)
            })
        }
    }
}

module.exports = IgnoreWarningsPlugin