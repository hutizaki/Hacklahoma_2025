// src/tracking/DetailedChangeTracker.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Define a structured log event.
export interface LogEvent {
  timestamp: string;
  event: "INITIAL" | "INSERTION" | "DELETION" | "OVERWRITE" | "SELECTION" | "UNDO" | "REDO" | "CUT";
  // For text changes, 'range' is formatted as "startLine:startCol-endLine:endCol"
  range?: string;
  inserted?: string;
  deleted?: string;
  // For selection events.
  selection?: string;
  // For INITIAL events, store the full content as an array of objects:
  // { line: number, range: string, content: string }
  initialContent?: { line: number, range: string, content: string }[];
}

export class DetailedChangeTracker {
  private disposables: vscode.Disposable[] = [];
  // Maintain a log buffer per document (keyed by document URI).
  private logBuffers: Map<string, LogEvent[]> = new Map();
  // Cache report file paths per document.
  private reportFilePaths: Map<string, string> = new Map();
  // Track the last selection string per document to avoid duplicate logging.
  private lastSelections: Map<string, string> = new Map();
  // Path to the current recording folder.
  private recordingFolderPath: string;

  // The constructor now accepts a storage base path (i.e. the workspace root).
  constructor(private storageBasePath: string) {
    this.recordingFolderPath = this.getRecordingFolder();
    this.initialize();
  }

  // Create (or get the next) Recording folder within the provided storage base path.
  private getRecordingFolder(): string {
    const basePath = this.storageBasePath;
    let maxRecording = 0;
    try {
      const entries = fs.readdirSync(basePath, { withFileTypes: true });
      entries.forEach(entry => {
        if (entry.isDirectory() && /^Recording\d+$/.test(entry.name)) {
          const num = parseInt(entry.name.replace('Recording', ''));
          if (num > maxRecording) {
            maxRecording = num;
          }
        }
      });
    } catch (err) {
      console.error("Error reading base directory for recording folder:", err);
    }
    const nextRecording = maxRecording + 1;
    const folderName = `Recording${nextRecording}`;
    const folderPath = path.join(basePath, folderName);
    if (!fs.existsSync(folderPath)) {
      try {
        fs.mkdirSync(folderPath);
      } catch (err) {
        console.error("Failed to create recording folder:", err);
      }
    }
    return folderPath;
  }

  // Get the report file path for a given document.
  private getReportFilePath(document: vscode.TextDocument): string {
    const docKey = document.uri.toString();
    if (this.reportFilePaths.has(docKey)) {
      return this.reportFilePaths.get(docKey)!;
    }
    // Use the recording folder for storing the report.
    const basePath = this.recordingFolderPath;
    const fileName = path.basename(document.fileName); // e.g., game.py
    const reportFileName = `${fileName}.json`; // becomes game.py.json
    const reportFilePath = path.join(basePath, reportFileName);
    this.reportFilePaths.set(docKey, reportFilePath);
    return reportFilePath;
  }

  // Ensure that a log buffer exists for the document.
  // If this is the first time, log the INITIAL event and generate its report file path.
  private ensureBuffer(document: vscode.TextDocument): void {
    const docKey = document.uri.toString();
    if (!this.logBuffers.has(docKey)) {
      this.logBuffers.set(docKey, []);
      // Generate and cache the report file path for this document.
      this.getReportFilePath(document);
      // Log INITIAL event for this document on first modification.
      const timestamp = new Date().toISOString();
      const lines = document.getText().split(/\r?\n/);
      const structuredLines = lines.map((line, idx) => ({
        line: idx,
        range: `${idx}:0-${idx}:${line.length}`,
        content: line
      }));
      const initialEvent: LogEvent = {
        timestamp,
        event: "INITIAL",
        initialContent: structuredLines
      };
      this.logBuffers.get(docKey)?.push(initialEvent);
    }
  }

  // Helper: Format a range as "startLine:startCol-endLine:endCol"
  private formatRange(range: vscode.Range): string {
    return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
  }

  private initialize() {
    // Listen for text document changes.
    const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
      const document = event.document;
      this.ensureBuffer(document);
      const docKey = document.uri.toString();
      const buffer = this.logBuffers.get(docKey)!;
      const timestamp = new Date().toISOString();

      event.contentChanges.forEach(change => {
        let logEvent: LogEvent | null = null;
        const rangeStr = this.formatRange(change.range);
        if (change.rangeLength > 0 && change.text === "") {
          // DELETION event.
          const deletedText = document.getText(change.range);
          logEvent = {
            timestamp,
            event: "DELETION",
            range: rangeStr,
            deleted: deletedText
          };
        } else if (change.rangeLength > 0 && change.text.length > 0) {
          // OVERWRITE event.
          const replacedText = document.getText(change.range);
          logEvent = {
            timestamp,
            event: "OVERWRITE",
            range: rangeStr,
            deleted: replacedText,
            inserted: change.text
          };
        } else {
          // INSERTION event.
          logEvent = {
            timestamp,
            event: "INSERTION",
            range: rangeStr,
            inserted: change.text
          };
        }
        if (logEvent) {
          console.log(JSON.stringify(logEvent));
          buffer.push(logEvent);
        }
      });
    });
    this.disposables.push(docChangeDisposable);

    // Listen for selection (cursor) changes.
    const selectionDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
      const document = event.textEditor.document;
      this.ensureBuffer(document);
      const docKey = document.uri.toString();
      const buffer = this.logBuffers.get(docKey)!;
      const timestamp = new Date().toISOString();
      const selections = event.selections
        .map(sel => `${sel.start.line}:${sel.start.character}-${sel.end.line}:${sel.end.character}`)
        .join(",");
      // Skip duplicate selection events for the same document.
      if (this.lastSelections.get(docKey) === selections) {
        return;
      }
      this.lastSelections.set(docKey, selections);
      const logEvent: LogEvent = {
        timestamp,
        event: "SELECTION",
        selection: selections
      };
      console.log(JSON.stringify(logEvent));
      buffer.push(logEvent);
    });
    this.disposables.push(selectionDisposable);

    // Listen for command execution events (UNDO, REDO, CUT) if available.
    if (typeof (vscode.commands as any).onDidExecuteCommand === 'function') {
      const commandDisposable = (vscode.commands as any).onDidExecuteCommand((e: any) => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) return;
        const document = activeEditor.document;
        this.ensureBuffer(document);
        const docKey = document.uri.toString();
        const buffer = this.logBuffers.get(docKey)!;
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
          buffer.push(logEvent);
        }
      });
      this.disposables.push(commandDisposable);
    } else {
      console.warn("vscode.commands.onDidExecuteCommand not available; UNDO/REDO/CUT events will not be logged.");
    }

    // Flush each document's log buffer every 2 seconds to update the report files.
    const flushInterval = setInterval(() => {
      for (const [docKey, buffer] of this.logBuffers.entries()) {
        if (buffer.length > 0) {
          // Get the report file path.
          const reportFilePath = this.reportFilePaths.get(docKey);
          if (!reportFilePath) continue;
          let reportData = { logs: [] as LogEvent[] };
          if (fs.existsSync(reportFilePath)) {
            try {
              const content = fs.readFileSync(reportFilePath, 'utf8');
              reportData = JSON.parse(content);
              if (!Array.isArray(reportData.logs)) {
                reportData.logs = [];
              }
            } catch (err) {
              console.error("Error reading report file:", err);
            }
          }
          // Append events from the buffer.
          reportData.logs.push(...buffer);
          try {
            fs.writeFileSync(reportFilePath, JSON.stringify(reportData, null, 2), 'utf8');
            console.log(`Report updated: ${reportFilePath}`);
          } catch (err) {
            console.error("Error writing report file:", err);
          }
          // Clear the buffer for this document.
          buffer.length = 0;
        }
      }
    }, 2000);
    this.disposables.push({ dispose: () => clearInterval(flushInterval) });
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}