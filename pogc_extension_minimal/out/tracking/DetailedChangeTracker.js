"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailedChangeTracker = void 0;
// src/tracking/DetailedChangeTracker.ts
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class DetailedChangeTracker {
    constructor() {
        this.disposables = [];
        this.logBuffer = [];
        // Keep a snapshot of each document's text (for future diffing if needed).
        this.documentSnapshots = new Map();
        this.initialize();
    }
    initialize() {
        // Listen for text document changes.
        const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            const timestamp = new Date().toISOString();
            // Process each change event.
            event.contentChanges.forEach(change => {
                const logEntry = `[${timestamp}] CHANGE in ${document.fileName} ` +
                    `Range: (${change.range.start.line}:${change.range.start.character} -> ${change.range.end.line}:${change.range.end.character}), ` +
                    `RangeLength: ${change.rangeLength}, Inserted: "${change.text}"`;
                console.log(logEntry);
                this.logBuffer.push(logEntry);
            });
            // Update our snapshot of the document.
            this.documentSnapshots.set(document.uri.toString(), document.getText());
        });
        this.disposables.push(docChangeDisposable);
        // Listen for selection (cursor) changes.
        const selectionDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
            const timestamp = new Date().toISOString();
            const selections = event.selections
                .map(sel => `(${sel.start.line}:${sel.start.character} -> ${sel.end.line}:${sel.end.character})`)
                .join(", ");
            const logEntry = `[${timestamp}] SELECTION in ${event.textEditor.document.fileName}: ${selections}`;
            console.log(logEntry);
            this.logBuffer.push(logEntry);
        });
        this.disposables.push(selectionDisposable);
        // Every 2 seconds, flush the log buffer to the console and update the JSON report.
        const interval = setInterval(() => {
            if (this.logBuffer.length > 0) {
                console.log("=== Flushing DetailedChangeTracker Logs ===");
                console.log(this.logBuffer.join("\n"));
                // Write the log buffer to a report file in the same folder as the active document.
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor) {
                    const document = activeEditor.document;
                    const baseName = path.basename(document.fileName, path.extname(document.fileName));
                    const fileDir = path.dirname(document.fileName);
                    const reportFileName = `${baseName}_report.json`;
                    const reportFilePath = path.join(fileDir, reportFileName);
                    let reportData = { logs: [] };
                    if (fs.existsSync(reportFilePath)) {
                        try {
                            const content = fs.readFileSync(reportFilePath, 'utf8');
                            reportData = JSON.parse(content);
                        }
                        catch (err) {
                            console.error("Error reading report file:", err);
                        }
                    }
                    // Append the current log buffer.
                    reportData.logs.push(...this.logBuffer);
                    // Write the updated data back to the file.
                    fs.writeFileSync(reportFilePath, JSON.stringify(reportData, null, 2), 'utf8');
                    console.log(`Report updated: ${reportFilePath}`);
                }
                // Clear the buffer after flushing.
                this.logBuffer = [];
            }
        }, 2000);
        this.disposables.push({ dispose: () => clearInterval(interval) });
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.DetailedChangeTracker = DetailedChangeTracker;
//# sourceMappingURL=DetailedChangeTracker.js.map