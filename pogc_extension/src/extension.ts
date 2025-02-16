// src/extension.ts
import * as vscode from 'vscode';
import { DetailedChangeTracker } from './tracking/DetailedChangeTracker';

let tracker: DetailedChangeTracker | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated!");

  // Use the workspace folder's root as the storage base, if available.
  const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : context.globalStorageUri.fsPath;

  // Ensure the chosen storage folder exists.
  vscode.workspace.fs.createDirectory(vscode.Uri.file(workspaceFolder)).then(() => {
    console.log("Storage folder ensured at:", workspaceFolder);
  }, (err) => {
    console.error("Failed to create storage folder", err);
  });

  // Register the start command.
  let startCommand = vscode.commands.registerCommand('pogc.start', () => {
    if (!tracker) {
      // Pass the workspace folder path to the tracker.
      tracker = new DetailedChangeTracker(workspaceFolder);
      context.subscriptions.push(tracker);
      vscode.commands.executeCommand('setContext', 'pogc.active', true);
      vscode.window.showInformationMessage("PoGC Extension Started!");
      console.log("Recording started");
    } else {
      vscode.window.showInformationMessage("Recording is already active.");
    }
  });

  // Register the stop command.
  let stopCommand = vscode.commands.registerCommand('pogc.stop', () => {
    if (tracker) {
      tracker.dispose();
      tracker = undefined;
      vscode.commands.executeCommand('setContext', 'pogc.active', false);
      vscode.window.showInformationMessage("PoGC Extension Stopped!");
      console.log("Recording stopped");
    } else {
      vscode.window.showInformationMessage("Recording is not active.");
    }
  });

  context.subscriptions.push(startCommand);
  context.subscriptions.push(stopCommand);
}

export function deactivate() {
  if (tracker) {
    tracker.dispose();
  }
  console.log("Extension deactivated.");
}