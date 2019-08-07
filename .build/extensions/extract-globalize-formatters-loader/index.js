"use strict";

const loaderUtils = require('loader-utils');
const fs = require("fs")
const path = require("path")
const babel = require("@babel/core")

module.exports = function(formattersSource) {
    this.cacheable && this.cacheable();
    const rootDir = process.cwd();
    const messagesPath = path.join(rootDir, "_translations")
    const availableLocales = fs.readdirSync(messagesPath).filter(f => /\.json$/.test(f)).map(f => f.replace(/\.json$/, ''))

    const captured = extractGlobalizeCalls(formattersSource)

    return JSON.stringify(Object.assign({
        availableLocales: availableLocales,
        messages: path.join(messagesPath, "[locale].json")
    }, captured))
}

const cache = {}
function extractGlobalizeCalls(code) {
    if (cache[code]) {
        return cache[code]
    }
    let exports = {}
    // before eval we need to transform es6 imports to cjs
    code = babel.transform(code, {
        plugins: ["@babel/plugin-transform-modules-commonjs"],
        babelrc: false
    }).code
    eval(code)
    const result = {};
    function interceptCall(methodName) {
        return function() {
            // babeljs transpiled code begin
            let args = []
            for (let _len = arguments.length, _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }
            // babeljs transpiled code end
            if (args.length === 1) {
                args = args[0]
            }
            (result[methodName] || (result[methodName] = [])).push(args)
            return true; // to disable fallbacks
        }
    }
    const fakeGlobalize = {}
    for (let methodName of ["dateFormatter", "relativeTimeFormatter", "unitFormatter", "currencyFormatter", "numberFormatter"]) {
        fakeGlobalize[methodName] = interceptCall(methodName + "s")
    }
    // Common static formatters catch
    ["NumberFormatter", "DateFormatter", "RelativeTimeFormatter", "UnitFormatter"].forEach(formatterName => {
        const FormatterClass = exports[formatterName]
        const formatter = new FormatterClass(fakeGlobalize)
        getFormatterMethods(formatter).forEach(methodName => {
            if (typeof formatter[methodName] === "function" && formatter[methodName].length === 0) {
                formatter[methodName]()
            }
        });
    });
    // custom Currency catch
    {
        const currencies = ["RUB","USD","EUR","UAH","BYR","KZT","CZK","AZM","KGS","MDL","AED",]
        const CurrencyFormatter = exports.CurrencyFormatter
        const currencyFormatter = new CurrencyFormatter(fakeGlobalize)
        getFormatterMethods(currencyFormatter).forEach(methodName => {
            currencies.forEach(currency => {
                currencyFormatter[methodName](currency)
            })
        })
    }
    return cache[code] = result;
}

function getFormatterMethods(formatter) {
    return Object.getOwnPropertyNames(formatter)
        .filter(name => name !== "constructor" && name !== "g" && name !== "getByName")
}
