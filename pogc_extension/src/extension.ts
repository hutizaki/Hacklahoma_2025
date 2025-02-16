import * as vscode from 'vscode';
import { KeystrokeTracker } from './tracking/KeystrokeTracker';
import { PasteDetector } from './detection/PasteDetector';
import { AiChecker } from './detection/AiChecker';
import { InsertComments } from './comments/InsertComments';

let keystrokeTracker: KeystrokeTracker;
let pasteDetector: PasteDetector;
let aiChecker: AiChecker;
let insertComments: InsertComments;

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated!");
  vscode.window.showInformationMessage('PoGC Extension Activated!');
  const outputChannel = vscode.window.createOutputChannel("PoGC Logs");
  outputChannel.appendLine("Extension activated!");
  // You could pass outputChannel to your trackers and call outputChannel.appendLine() there.

  // Initialize the modules and assign them to the outer variables
  keystrokeTracker = new KeystrokeTracker();
  pasteDetector = new PasteDetector();
  aiChecker = new AiChecker();
  insertComments = new InsertComments();

  context.subscriptions.push(keystrokeTracker, pasteDetector, aiChecker, insertComments);

  // Example command registration
  let disposable = vscode.commands.registerCommand('pogc.showReport', () => {
    vscode.window.showInformationMessage('Report feature coming soon!');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (keystrokeTracker) keystrokeTracker.dispose();
  if (pasteDetector) pasteDetector.dispose();
  if (aiChecker) aiChecker.dispose();
  if (insertComments) insertComments.dispose();
}
