"use strict";

const fs = require("fs");
const ts = require("typescript");
const babylon = require("babylon");
const traverse = require("@babel/traverse").default;

/**
 * Плагин для бабеля, который конвертирует импорты из src/lib/components в конкретные импорты компонентов.
 * Например:
 *
 * В src/lib/components определён экспорт:
 * export {default as CButton} from "./components/CButton/CButton"
 *
 * В модуле определён импорт:
 * import {CButton} from "src/lib/components"
 *
 * Задача плагина в модуле заменить импорт на:
 * import {default as CButton} from "src/lib/components/CButton/CButton"
 *
 * @param babel
 * @returns {{name: string, visitor: {ImportDeclaration: (function(*))}}}
 */
module.exports =  function (babel) {
    const t = babel.types;

    // Сначала надо просканировать src/lib/components
    const componentsFileSource = fs.readFileSync(__dirname + "/../../../src/web/lib/components.ts", "utf8");
    // Он написан на typescript, транспилим его в es2015
    const transpiledComponentsFile = ts.transpileModule(
        componentsFileSource,
        { compilerOptions: { module: ts.ModuleKind.ES2015, target: ts.ScriptTarget.ES2015 } }
    ).outputText;
    // Собираем ast
    const componentsFileAst = babylon.parse(transpiledComponentsFile, {sourceType: "module"});

    const components = {};
    // Сканируем экспорты, складываем с хэш.
    traverse(componentsFileAst, {
        ExportNamedDeclaration(path) {
            const from = path.node.source.value.replace(/^\.\//, "src/lib/")
            for (let specifier of path.node.specifiers) {
                components[specifier.exported.name] = {
                    local: specifier.local.name,
                    from: from
                }
            }
        }
    });

    // плагином все импорты заменяем
    return {
        name: "ast-transform", // not required
        visitor: {
            ImportDeclaration(path) {
                if (path.node.source.value === "src/lib/components") {
                    let remove = true;
                    for (let specifier of path.node.specifiers) {
                        if (specifier.type !== "ImportNamespaceSpecifier") {
                            if (specifier.imported.name in components) {
                                const replaceTo = components[specifier.imported.name]
                                path.insertAfter(t.ImportDeclaration(
                                    [
                                        t.ImportSpecifier(
                                            t.Identifier(specifier.imported.name), // local
                                            t.Identifier(replaceTo.local) // imported
                                        )
                                    ],
                                    t.stringLiteral(replaceTo.from)
                                ))
                            }
                        } else {
                            remove = false;
                        }
                    }
                    if (remove) {
                        path.remove()
                    }
                }
            },
        }
    };
}
