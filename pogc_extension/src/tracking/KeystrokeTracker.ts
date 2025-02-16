import * as vscode from 'vscode';

export class KeystrokeTracker {
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen for text document changes and log details
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      console.log(`Document ${event.document.fileName} was edited.`);
      event.contentChanges.forEach((change) => {
        console.log(`Inserted text: "${change.text}" at line ${change.range.start.line}, character ${change.range.start.character}`);
      });
    });
    this.disposables.push(disposable);
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
