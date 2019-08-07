import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "cyrillic symbols in string literals are forbidden";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoCyrillicInCodeWalker(sourceFile, this.getOptions()));
    }
}

const regexp = /[А-Яа-я]/

// The walker takes care of all the work.
class NoCyrillicInCodeWalker extends Lint.RuleWalker {

    private validateNode(node: ts.Node) {
        if (regexp.test(node.getText())) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
    }

    protected visitTemplateExpression(node: ts.TemplateExpression): void {
        this.validateNode(node)
        super.visitTemplateExpression(node);
    }

    protected visitJsxElement(node: ts.JsxElement): void {
        ts.forEachChild(node, child => {
            if (child.kind === ts.SyntaxKind.JsxText) {
                this.validateNode(child)
            } else {
                this.visitNode(child)
            }
        })
    }

    protected visitStringLiteral(node: ts.StringLiteral): void {
        this.validateNode(node)
        super.visitStringLiteral(node);
    }
}
