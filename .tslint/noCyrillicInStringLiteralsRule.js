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
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoCyrillicInCodeWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "cyrillic symbols in string literals are forbidden";
exports.Rule = Rule;
var regexp = /[А-Яа-я]/;
// The walker takes care of all the work.
var NoCyrillicInCodeWalker = (function (_super) {
    __extends(NoCyrillicInCodeWalker, _super);
    function NoCyrillicInCodeWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoCyrillicInCodeWalker.prototype.validateNode = function (node) {
        if (regexp.test(node.getText())) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
    };
    NoCyrillicInCodeWalker.prototype.visitTemplateExpression = function (node) {
        this.validateNode(node);
        _super.prototype.visitTemplateExpression.call(this, node);
    };
    NoCyrillicInCodeWalker.prototype.visitJsxElement = function (node) {
        var _this = this;
        ts.forEachChild(node, function (child) {
            if (child.kind === ts.SyntaxKind.JsxText) {
                _this.validateNode(child);
            }
            else {
                _this.visitNode(child);
            }
        });
    };
    NoCyrillicInCodeWalker.prototype.visitStringLiteral = function (node) {
        this.validateNode(node);
        _super.prototype.visitStringLiteral.call(this, node);
    };
    return NoCyrillicInCodeWalker;
}(Lint.RuleWalker));
