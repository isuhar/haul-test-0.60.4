module.exports = function(babel) {
    const { types: t } = babel;

    const decorateVisitor = {
        CallExpression(path) {
            if (
                t.isMemberExpression(path.node.callee) &&
                t.isIdentifier(path.node.callee.object, {name: this.tslibAlias}) &&
                t.isIdentifier(path.node.callee.property, {name: "__metadata"}) &&
                path.node.arguments.length === 2 &&
                t.isStringLiteral(path.node.arguments[0])
            ) {
                path.get("arguments")[1].replaceWith(
                    t.callExpression(
                        t.memberExpression(t.Identifier("Reflect"), t.Identifier("asFactory")),
                        [t.arrowFunctionExpression([], path.node.arguments[1])]
                    )
                )
            }
        }
    };

    return {
        name: "transform-metadata-to-lazy", // not required
        visitor: {
            ImportDeclaration(path) {
                if (path.node.source.value === "tslib") {
                    for (const spec of path.node.specifiers) {
                        if (t.isImportNamespaceSpecifier(spec)) {
                            path
                                .scope
                                .getProgramParent()
                                .path
                                .traverse(decorateVisitor, {
                                    tslibAlias: spec.local.name
                                });
                        }
                    }
                }
            }
        }
    };
}
