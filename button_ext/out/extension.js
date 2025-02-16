"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    // Log activation.
    console.log('Button Extension is now active');
    // Set initial context so the "start" button shows.
    vscode.commands.executeCommand('setContext', 'button.active', false);
    // Register the start command.
    let startCommand = vscode.commands.registerCommand('button.start', () => {
        vscode.window.showInformationMessage('Starting');
        vscode.commands.executeCommand('setContext', 'button.active', true);
    });
    // Register the stop command.
    let stopCommand = vscode.commands.registerCommand('button.stop', () => {
        vscode.window.showInformationMessage('Stopped');
        vscode.commands.executeCommand('setContext', 'button.active', false);
    });
    context.subscriptions.push(startCommand, stopCommand);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map