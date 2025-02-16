import * as vscode from 'vscode';
import { ChangeTracker } from './tracking/ChangeTracker';

let changeTracker: ChangeTracker | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('PoGC Extension Activated');

  changeTracker = new ChangeTracker();
  context.subscriptions.push(changeTracker);
}
// Flagged method: Answer below why you chose recur
// 
export function deactivate() {
  console.log('PoGC Extension Deactivated');
  
  if (changeTracker) {
    changeTracker.dispose();
  }
}
