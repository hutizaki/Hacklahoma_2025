import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ChangeTracker {
  private disposables: vscode.Disposable[] = [];
  private individualChanges: { timestamp: string; before: string; after: string }[] = [];
  private gitChanges: { timestamp: string; changeType: string; content: string }[] = [];
  private filePath: string | null = null;
  private interval: NodeJS.Timeout | undefined;
  private numSessions: number = 1;
  private lastEditTime: number = 0;
  private unsavedChanges: boolean = false;
  private lastClipboardContent: string = "";
  private lastTypedWord: string = "";

  constructor() {
    this.initialize();
  }

  private initialize() {
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) return;

      const document = activeEditor.document;
      const fileName = path.basename(document.fileName, path.extname(document.fileName));
      const reportFileName = `${fileName}_report.json`;
      const fileDir = path.dirname(document.fileName);
      this.filePath = path.join(fileDir, reportFileName);

      let existingData: any = { numSessions: 1, sessions: {} };
      if (fs.existsSync(this.filePath)) {
        try {
          const fileContents = fs.readFileSync(this.filePath, 'utf8');
          existingData = JSON.parse(fileContents);
          if (existingData.numSessions) {
            this.numSessions = existingData.numSessions;
          }
        } catch (error) {
          console.error("Error reading existing JSON file:", error);
        }
      }

      const currentTime = Date.now();
      const timeSinceLastEdit = currentTime - this.lastEditTime;

      if (!this.unsavedChanges && timeSinceLastEdit > 30000) {
        this.numSessions += 1;
      }
      this.lastEditTime = currentTime;
      this.unsavedChanges = true;

      event.contentChanges.forEach(change => {
        const timestamp = new Date().toISOString();
        const before = document.getText(change.range);
        const after = change.text;

        // ✅ Detect and log large pastes as Git-style changes
        if (after.length > 20) {
            this.gitChanges.push({ timestamp, changeType: "Large Paste", content: after });
        }
        // ✅ Fix: Detect capitalization changes (e.g., "b" → "B") correctly
        else if (before.length === 1 && after.length === 1 && before.toLowerCase() === after.toLowerCase() && before !== after) {
            this.individualChanges.push({ timestamp, before, after: "(capitalization changed to '" + after + "')" });
        }
        // ✅ Fix: Detect selection-based deletions (e.g., mouse delete or shift+delete)
        else if (before.length > 0 && after.length === 0 && change.rangeLength > 1) {
            this.individualChanges.push({ timestamp, before, after: "(selected & deleted)" });
        }
        // ✅ Fix: Detect selection-based replacements (e.g., "we" → "Im")
        else if (before.length > 0 && after.length > 0 && change.rangeLength > 1) {
            this.individualChanges.push({ timestamp, before, after: "(selected & replaced with '" + after + "')" });
        }
        // ✅ Fix: Detect backspace-based word replacements (e.g., "bryan" → "Bryan" → "Jared")
        else if (before.length > 0 && after.length > 0 && before !== after) {
            this.individualChanges.push({ timestamp, before, after: "(backspaced & replaced with '" + after + "')" });
        }
        // ✅ Detect whitespace deletions properly
        else if (before.length > 0 && after.length === 0 && before.trim() === "") {
            this.individualChanges.push({ timestamp, before, after: "(whitespace deleted)" });
        }
        // ✅ Log normal deletions (single character or backspace)
        else if (before.length > 0 && after.length === 0) {
            this.individualChanges.push({ timestamp, before, after: "(deleted)" });
        }
        // ✅ Log standard insertions
        else if (before.trim() !== after.trim()) {
            this.individualChanges.push({ timestamp, before, after });
        }
      });
    });

    this.disposables.push(disposable);

    this.interval = setInterval(async () => {
      const clipboardText = await vscode.env.clipboard.readText();
      if (clipboardText !== this.lastClipboardContent && clipboardText.length > 0) {
        const recentInsertions = this.individualChanges.map(change => change.after);
        if (recentInsertions.includes(clipboardText)) {
          const timestamp = new Date().toISOString();
          this.gitChanges.push({
            timestamp,
            changeType: "Clipboard Paste",
            content: clipboardText
          });
        }
        this.lastClipboardContent = clipboardText;
      }
    }, 1000);
  }

  private saveToJson() {
    if (!this.filePath) return;

    let existingData: any = { numSessions: this.numSessions, sessions: {} };

    if (fs.existsSync(this.filePath)) {
      try {
        const fileContents = fs.readFileSync(this.filePath, 'utf8');
        existingData = JSON.parse(fileContents);
      } catch (error) {
        console.error("Error reading existing JSON file:", error);
      }
    }

    if (!existingData.sessions) {
      existingData.sessions = {};
    }

    if (!existingData.sessions[this.numSessions]) {
      existingData.sessions[this.numSessions] = {
        individualChanges: this.individualChanges,
        gitChanges: this.gitChanges
      };
    }

    existingData.numSessions = this.numSessions;
    this.individualChanges = [];
    this.gitChanges = [];
    this.unsavedChanges = false;

    fs.writeFileSync(this.filePath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log(`Change log updated for session ${this.numSessions}: ${this.filePath}`);
  }

  public dispose() {
    this.saveToJson();
    this.disposables.forEach(d => d.dispose());
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
