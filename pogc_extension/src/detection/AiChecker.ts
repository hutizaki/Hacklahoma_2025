import * as vscode from 'vscode';

export class AiChecker {
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      event.contentChanges.forEach(change => {
        // Very basic heuristic: flag if the text contains "AI"
        if (change.text.includes("AI")) {
          console.log(`AI Checker: Suspicious text in ${event.document.fileName}`);
        }
      });
    });
    this.disposables.push(disposable);
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
