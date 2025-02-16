import * as vscode from 'vscode';
import { KeystrokeTracker } from './tracking/KeystrokeTracker';

let keystrokeTracker: KeystrokeTracker;

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('PoGC Extension Activated!');

  // Initialize the keystroke tracker
  keystrokeTracker = new KeystrokeTracker();
  context.subscriptions.push(keystrokeTracker);

  // Register a command to verify tracking is running
  let disposable = vscode.commands.registerCommand('pogc.checkTracking', () => {
    vscode.window.showInformationMessage('Keystroke tracking is active!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (keystrokeTracker) {
    keystrokeTracker.dispose();
  }
}
