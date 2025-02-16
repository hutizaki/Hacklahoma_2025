// src/tracking/DetailedChangeTracker.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Define a structured log event.
interface LogEvent {
  timestamp: string;
  event: "INSERTION" | "DELETION" | "OVERWRITE" | "SELECTION" | "UNDO" | "REDO" | "CUT";
  // For text changes, 'range' is formatted as "start-end" using column indices.
  range?: string;
  inserted?: string;
  deleted?: string;
  // For selection events, we log a selection string.
  selection?: string;
}

export class DetailedChangeTracker {
  private disposables: vscode.Disposable[] = [];
  private logBuffer: LogEvent[] = [];
  // Track last selection per document to avoid duplicate logs.
  private lastSelections: Map<string, string> = new Map();
  // Track last deletion range per document.
  private lastDeletionRanges: Map<string, string> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Helper to format a range as "start-end" (using column indices).
    const formatRange = (range: vscode.Range): string =>
      `${range.start.character}-${range.end.character}`;

    // Listen for text document changes.
    const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      const timestamp = new Date().toISOString();
      const docKey = document.uri.toString();

      event.contentChanges.forEach(change => {
        let logEvent: LogEvent;
        const rangeStr = formatRange(change.range);
        // Check for deletion.
        if (change.rangeLength > 0 && change.text === "") {
          // Avoid duplicate deletion logs.
          if (this.lastDeletionRanges.get(docKey) === rangeStr) return;
          const deletedText = document.getText(change.range);
          logEvent = {
            timestamp,
            event: "DELETION",
            range: rangeStr,
            deleted: deletedText
          };
          this.lastDeletionRanges.set(docKey, rangeStr);
        } 
        // Overwrite: a selection is replaced.
        else if (change.rangeLength > 0 && change.text.length > 0) {
          const replacedText = document.getText(change.range);
          logEvent = {
            timestamp,
            event: "OVERWRITE",
            range: rangeStr,
            deleted: replacedText,
            inserted: change.text
          };
        }
        // Otherwise, treat as insertion.
        else {
          logEvent = {
            timestamp,
            event: "INSERTION",
            range: rangeStr,
            inserted: change.text
          };
        }
        console.log(JSON.stringify(logEvent));
        this.logBuffer.push(logEvent);
      });
    });
    this.disposables.push(docChangeDisposable);

    // Listen for selection (cursor) changes.
    const selectionDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
      const document = event.textEditor.document;
      const timestamp = new Date().toISOString();
      const docKey = document.uri.toString();
      const selectionStr = event.selections
        .map(sel => `${sel.start.character}-${sel.end.character}`)
        .join(",");
      if (this.lastSelections.get(docKey) === selectionStr) return;
      this.lastSelections.set(docKey, selectionStr);
      const logEvent: LogEvent = {
        timestamp,
        event: "SELECTION",
        selection: selectionStr
      };
      console.log(JSON.stringify(logEvent));
      this.logBuffer.push(logEvent);
    });
    this.disposables.push(selectionDisposable);

    // Listen for command execution events (if the proposed API is enabled).
    if (typeof (vscode.commands as any).onDidExecuteCommand === 'function') {
      const commandDisposable = (vscode.commands as any).onDidExecuteCommand((e: any) => {
        const timestamp = new Date().toISOString();
        let logEvent: LogEvent | null = null;
        if (e.command === 'undo') {
          logEvent = { timestamp, event: "UNDO" };
        } else if (e.command === 'redo') {
          logEvent = { timestamp, event: "REDO" };
        } else if (e.command === 'editor.action.clipboardCutAction') {
          logEvent = { timestamp, event: "CUT" };
        }
        if (logEvent) {
          console.log(JSON.stringify(logEvent));
          this.logBuffer.push(logEvent);
        }
      });
      this.disposables.push(commandDisposable);
    } else {
      console.warn("vscode.commands.onDidExecuteCommand is not available. Undo/Redo/Cut events will not be logged.");
    }

    // Every 2 seconds, flush the logBuffer to the console and update the JSON report.
    const flushInterval = setInterval(() => {
      if (this.logBuffer.length > 0) {
        console.log("=== Flushing DetailedChangeTracker Logs ===");
        console.log(JSON.stringify(this.logBuffer, null, 2));
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          const document = activeEditor.document;
          const baseName = path.basename(document.fileName, path.extname(document.fileName));
          const fileDir = path.dirname(document.fileName);
          const reportFileName = `${baseName}_report.json`;
          const reportFilePath = path.join(fileDir, reportFileName);
          let reportData: { logs: LogEvent[] } = { logs: [] };
          if (fs.existsSync(reportFilePath)) {
            try {
              const content = fs.readFileSync(reportFilePath, 'utf8');
              reportData = JSON.parse(content);
            } catch (err) {
              console.error("Error reading report file:", err);
            }
          }
          reportData.logs.push(...this.logBuffer);
          try {
            fs.writeFileSync(reportFilePath, JSON.stringify(reportData, null, 2), 'utf8');
            console.log(`Report updated: ${reportFilePath}`);
          } catch (err) {
            console.error("Error writing report file:", err);
          }
        }
        this.logBuffer = [];
      }
    }, 2000);
    this.disposables.push({ dispose: () => clearInterval(flushInterval) });
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
