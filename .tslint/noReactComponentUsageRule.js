"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoReactComponentUsageWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var LeftBrace = "<";
var Comma = ",";
var LineBreak = "\n";
// Левая скобка используется, чтобы быть уверенными, что заменяем именно React.Component, с не какой-нибудь React.ComponentClass
var ReactComponentClass = 'React.Component' + LeftBrace;
var MegaplanComponentClass = 'Component';
var ErrorMessage = "Usage of React.Component is prohibited. Use src/lib/components/Component instead.";
var ImportSearchExistingSingleLine = '} from "src/lib/components"';
var ImportSearchExistingMultiLine = LineBreak + ImportSearchExistingSingleLine;
var ImportExistingLineReplacement = MegaplanComponentClass;
var ImportLine = 'import {Component} from "src/lib/components"' + LineBreak;
var NoReactComponentUsageWalker = (function (_super) {
    __extends(NoReactComponentUsageWalker, _super);
    function NoReactComponentUsageWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoReactComponentUsageWalker.prototype.visitSourceFile = function (node) {
        var index = 0;
        var hasEntries = true;
        while (hasEntries) {
            var position = node.text.indexOf(ReactComponentClass, index);
            if (position >= 0) {
                var replacement = [
                    new Lint.Replacement(position, ReactComponentClass.length, MegaplanComponentClass + LeftBrace)
                ];
                // Импорт меняем только для первого совпадения
                if (index === 0) {
                    replacement.push(this.getImportReplacement(node));
                }
                var failure = this.createFailure(position, ReactComponentClass.length, ErrorMessage, replacement);
                this.addFailure(failure);
                index = position + ReactComponentClass.length;
            }
            else {
                hasEntries = false;
            }
        }
        // call the base version of this visitor to actually parse this node
        _super.prototype.visitSourceFile.call(this, node);
    };
    NoReactComponentUsageWalker.prototype.getImportReplacement = function (node) {
        var replacement = new Lint.Replacement(0, 0, ImportLine);
        var importPositionMultiLine = node.text.indexOf(ImportSearchExistingMultiLine);
        if (importPositionMultiLine >= 0) {
            var strBeforeImport = node.text.substr(0, importPositionMultiLine).trim();
            if (strBeforeImport.charAt(strBeforeImport.length - 1) === Comma) {
                replacement = new Lint.Replacement(importPositionMultiLine, 0, LineBreak + '  ' + ImportExistingLineReplacement);
            }
            else {
                replacement = new Lint.Replacement(importPositionMultiLine, 0, Comma + LineBreak + '  ' + ImportExistingLineReplacement);
            }
        }
        else {
            var importPositionSingleLine = node.text.indexOf(ImportSearchExistingSingleLine);
            if (importPositionSingleLine >= 0) {
                replacement = new Lint.Replacement(importPositionSingleLine, 0, Comma + ' ' + ImportExistingLineReplacement);
            }
        }
        return replacement;
    };
    return NoReactComponentUsageWalker;
}(Lint.RuleWalker));
