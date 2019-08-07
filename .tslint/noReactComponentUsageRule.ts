import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoReactComponentUsageWalker(sourceFile, this.getOptions()));
    }
}
const LeftBrace = "<";
const Comma = ",";
const LineBreak = "\n";
// Левая скобка используется, чтобы быть уверенными, что заменяем именно React.Component, с не какой-нибудь React.ComponentClass
const ReactComponentClass = 'React.Component' + LeftBrace;
const MegaplanComponentClass = 'Component';
const ErrorMessage = "Usage of React.Component is prohibited. Use src/lib/components/Component instead.";

const ImportSearchExistingSingleLine = '} from "src/lib/components"';
const ImportSearchExistingMultiLine = LineBreak + ImportSearchExistingSingleLine;
const ImportExistingLineReplacement = MegaplanComponentClass;
const ImportLine = 'import {Component} from "src/lib/components"' + LineBreak;


class NoReactComponentUsageWalker extends Lint.RuleWalker {
    public visitSourceFile(node: ts.SourceFile){
        let index = 0;
        let hasEntries = true;

        while (hasEntries) {
            const position = node.text.indexOf(ReactComponentClass, index);

            if (position >= 0) {
                let replacement = [
                    new Lint.Replacement(position, ReactComponentClass.length, MegaplanComponentClass + LeftBrace)
                ];
                // Импорт меняем только для первого совпадения
                if (index === 0) {
                    replacement.push(this.getImportReplacement(node));
                }
                const failure = this.createFailure(
                    position,
                    ReactComponentClass.length,
                    ErrorMessage,
                    replacement
                );
                this.addFailure(failure);

                index = position + ReactComponentClass.length;
            } else {
                hasEntries = false;
            }
        }

        // call the base version of this visitor to actually parse this node
        super.visitSourceFile(node);
    }

    getImportReplacement(node: ts.SourceFile) {
        let replacement = new Lint.Replacement(0, 0, ImportLine);

        const importPositionMultiLine = node.text.indexOf(ImportSearchExistingMultiLine)
        if (importPositionMultiLine >= 0) {
            const strBeforeImport = node.text.substr(0, importPositionMultiLine).trim();
            if (strBeforeImport.charAt(strBeforeImport.length - 1) === Comma) {
                replacement = new Lint.Replacement(importPositionMultiLine, 0, LineBreak + '  ' + ImportExistingLineReplacement);
            } else {
                replacement = new Lint.Replacement(importPositionMultiLine, 0, Comma + LineBreak + '  ' + ImportExistingLineReplacement);
            }

        } else {
            const importPositionSingleLine = node.text.indexOf(ImportSearchExistingSingleLine);
            if (importPositionSingleLine >= 0) {
                replacement = new Lint.Replacement(importPositionSingleLine, 0, Comma + ' ' + ImportExistingLineReplacement);
            }
        }

        return replacement;
    }
}
