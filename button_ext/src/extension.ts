import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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

export function deactivate() {}
