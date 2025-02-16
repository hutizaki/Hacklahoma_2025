import * as vscode from 'vscode';

export class PasteDetector {
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      event.contentChanges.forEach(change => {
        // If the inserted text is very long, consider it a paste
        if (change.text.length > 50) {
          console.log(`Paste detected in ${event.document.fileName}: ${change.text.substring(0, 50)}...`);
        }
      });
    });
    this.disposables.push(disposable);
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
