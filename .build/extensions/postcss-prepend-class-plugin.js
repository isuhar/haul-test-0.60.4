"use strict";
const postcss = require('postcss');
const Rule = require('postcss/lib/rule')
const AtRule = require('postcss/lib/at-rule')

module.exports = postcss.plugin('prepend-class-plugin', function prependClassPlugin(options) {
    return function (css) {
        options = options || {};
        if (!options.className) {
            throw new Error("Please set className option to prepend-class-plugin");
        }
        const htmlTagRegexp = /\bhtml\b/
        const bodyTagRegexp = /\bbody\b/

        function prependClass(node) {
            if (node instanceof Rule) {
                node.selectors = node.selectors.map(function(selector) {
                    if (htmlTagRegexp.test(selector) || bodyTagRegexp.test(selector)) {
                        return selector;
                    } else {
                        return options.className + " " + selector
                    }
                });
            }
        }

        css.each(function(node) {
            if (node instanceof AtRule && node.name.includes("media")) {
                node.each(prependClass)
            } else {
                prependClass(node)
            }

        })
    }
});
