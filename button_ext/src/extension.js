"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
var vscode = require("vscode");
function activate(context) {
    // Register the empty button command.
    var disposable = vscode.commands.registerCommand('emptyButton.click', function () {
        vscode.window.showInformationMessage('Empty Button Clicked!');
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
