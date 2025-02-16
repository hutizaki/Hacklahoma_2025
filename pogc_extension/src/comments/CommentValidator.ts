import * as vscode from 'vscode';

export class CommentValidator {
  public validateComments(document: vscode.TextDocument): boolean {
    const text = document.getText();
    if (text.includes("EXPLAIN:") && text.includes("Please add your explanation")) {
      vscode.window.showWarningMessage("Some code sections are missing explanations.");
      return false;
    }
    return true;
  }

  public dispose() {
    // Clean up if necessary
  }
}
