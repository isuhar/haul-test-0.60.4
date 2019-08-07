module.exports = function(babel) {
    const t = babel.types;
    const aliasName = "dom"
    return {
        visitor: {
            Program(path) {
                path.traverse({
                    Identifier(path) {
                        if (path.node.name === aliasName) {
                            path.scope.rename(aliasName);
                        }
                    }
                })
            },
            CallExpression(path) {
                const {callee} = path.node;
                const {scope} = path;
                if (
                    t.isMemberExpression(callee) &&
                    callee.object.name === 'React' &&
                    callee.property.name === 'createElement'
                ) {
                    const newIdentifier = t.identifier(aliasName);
                    path.node.callee = newIdentifier;
                }
            }
        }
    }
}
