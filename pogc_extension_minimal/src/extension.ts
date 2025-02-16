// src/extension.ts
import * as vscode from 'vscode';
import { DetailedChangeTracker } from './tracking/DetailedChangeTracker';

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated with DetailedChangeTracker!");
  vscode.window.showInformationMessage("PoGC Extension Activated!");

  // Instantiate the detailed change tracker to capture every editing action.
  const changeTracker = new DetailedChangeTracker();
  context.subscriptions.push(changeTracker);
}

export function deactivate() {
  console.log("Extension deactivated.");
}
