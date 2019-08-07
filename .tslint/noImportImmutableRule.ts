import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        // create a failure at the current position
        const moduleFailure = this.getModuleFailure(node.moduleSpecifier.getText())
        if (typeof moduleFailure === "string") {
            this.addFailure(this.createFailure(
                node.getStart(),
                node.getWidth(),
                moduleFailure
            ));
        }

        // call the base version of this visitor to actually parse this node
        super.visitImportDeclaration(node);
    }

    private getModuleFailure(moduleName: string): string | never {
        if ("\"immutable\"" === moduleName) {
            return "\"immutable\" is deprecated. Please use \"src/lib/collections\" for List, Map and etc types"
        }
    }
}
