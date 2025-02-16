import * as vscode from 'vscode';

export class InsertComments {
  public insertExplainComment(document: vscode.TextDocument, position: vscode.Position) {
    const edit = new vscode.WorkspaceEdit();
    const commentText = `// EXPLAIN: The following code might be flagged. Please add your explanation.\n`;
    edit.insert(document.uri, position, commentText);
    vscode.workspace.applyEdit(edit);
    console.log(`Inserted comment at line ${position.line}`);
  }

  public dispose() {
    // Clean up if necessary
  }
}
