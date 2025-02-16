import * as vscode from 'vscode';

export class KeystrokeTracker {
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen for text document changes
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      // Log the file name whenever it changes
      console.log(`Document ${event.document.fileName} was edited.`);

      // If you want more detail, log the text that was inserted/changed
      event.contentChanges.forEach((change) => {
        console.log(`Inserted text: "${change.text}" at ${change.range}`);
      });
    });

    this.disposables.push(disposable);
  }

  // Dispose resources when the tracker is no longer needed
  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
