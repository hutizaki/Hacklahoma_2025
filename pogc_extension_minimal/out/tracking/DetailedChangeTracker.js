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
        // Track last selection per document to avoid duplicate logs.
        this.lastSelections = new Map();
        // Track last deletion range per document.
        this.lastDeletionRanges = new Map();
        this.initialize();
    }
    initialize() {
        // Helper to format a range as "start-end" (using column indices).
        const formatRange = (range) => `${range.start.character}-${range.end.character}`;
        // Listen for text document changes.
        const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            const timestamp = new Date().toISOString();
            const docKey = document.uri.toString();
            event.contentChanges.forEach(change => {
                let logEvent;
                const rangeStr = formatRange(change.range);
                // Check for deletion.
                if (change.rangeLength > 0 && change.text === "") {
                    // Avoid duplicate deletion logs.
                    if (this.lastDeletionRanges.get(docKey) === rangeStr)
                        return;
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
            if (this.lastSelections.get(docKey) === selectionStr)
                return;
            this.lastSelections.set(docKey, selectionStr);
            const logEvent = {
                timestamp,
                event: "SELECTION",
                selection: selectionStr
            };
            console.log(JSON.stringify(logEvent));
            this.logBuffer.push(logEvent);
        });
        this.disposables.push(selectionDisposable);
        // Listen for command execution events (if the proposed API is enabled).
        if (typeof vscode.commands.onDidExecuteCommand === 'function') {
            const commandDisposable = vscode.commands.onDidExecuteCommand((e) => {
                const timestamp = new Date().toISOString();
                let logEvent = null;
                if (e.command === 'undo') {
                    logEvent = { timestamp, event: "UNDO" };
                }
                else if (e.command === 'redo') {
                    logEvent = { timestamp, event: "REDO" };
                }
                else if (e.command === 'editor.action.clipboardCutAction') {
                    logEvent = { timestamp, event: "CUT" };
                }
                if (logEvent) {
                    console.log(JSON.stringify(logEvent));
                    this.logBuffer.push(logEvent);
                }
            });
            this.disposables.push(commandDisposable);
        }
        else {
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
                    reportData.logs.push(...this.logBuffer);
                    try {
                        fs.writeFileSync(reportFilePath, JSON.stringify(reportData, null, 2), 'utf8');
                        console.log(`Report updated: ${reportFilePath}`);
                    }
                    catch (err) {
                        console.error("Error writing report file:", err);
                    }
                }
                this.logBuffer = [];
            }
        }, 2000);
        this.disposables.push({ dispose: () => clearInterval(flushInterval) });
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.DetailedChangeTracker = DetailedChangeTracker;
//# sourceMappingURL=DetailedChangeTracker.js.map