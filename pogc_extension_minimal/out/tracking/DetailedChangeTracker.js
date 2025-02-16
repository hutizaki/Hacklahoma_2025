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
        // Cache report file paths per document.
        this.reportFilePaths = new Map();
        // Track whether an INITIAL event has been logged for a document.
        this.initialLogged = new Map();
        this.initialize();
    }
    // Helper: Determine the next report file path for a document.
    getReportFilePath(document) {
        const docKey = document.uri.toString();
        if (this.reportFilePaths.has(docKey)) {
            return this.reportFilePaths.get(docKey);
        }
        const fileDir = path.dirname(document.fileName);
        const baseName = path.basename(document.fileName, path.extname(document.fileName));
        let maxSession = 0;
        try {
            const files = fs.readdirSync(fileDir);
            const regex = new RegExp(`^${baseName}_report(\\d+)\\.json$`);
            files.forEach(file => {
                const match = file.match(regex);
                if (match && match[1]) {
                    const num = parseInt(match[1]);
                    if (num > maxSession) {
                        maxSession = num;
                    }
                }
            });
        }
        catch (err) {
            console.error("Error reading directory:", err);
        }
        const nextSession = maxSession + 1;
        const reportFileName = `${baseName}_report${nextSession}.json`;
        const reportFilePath = path.join(fileDir, reportFileName);
        this.reportFilePaths.set(docKey, reportFilePath);
        return reportFilePath;
    }
    // Helper: Format a range as "startLine:startCol-endLine:endCol"
    formatRange(range) {
        return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
    }
    // Helper: Log an INITIAL event for a document.
    logInitial(document) {
        const docKey = document.uri.toString();
        if (this.initialLogged.get(docKey))
            return;
        const timestamp = new Date().toISOString();
        const lines = document.getText().split(/\r?\n/);
        const structuredLines = lines.map((line, idx) => {
            return {
                line: idx,
                range: `${idx}:0-${idx}:${line.length}`,
                content: line
            };
        });
        const initialEvent = {
            timestamp,
            event: "INITIAL",
            initialContent: structuredLines
        };
        console.log("INITIAL EVENT: " + JSON.stringify(initialEvent));
        this.logBuffer.push(initialEvent);
        this.initialLogged.set(docKey, true);
    }
    initialize() {
        // Log INITIAL for documents as they open.
        const openDisposable = vscode.workspace.onDidOpenTextDocument((document) => {
            this.logInitial(document);
        });
        this.disposables.push(openDisposable);
        // For already open documents.
        vscode.workspace.textDocuments.forEach(document => {
            this.logInitial(document);
        });
        // Listen for text document changes.
        const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            const timestamp = new Date().toISOString();
            event.contentChanges.forEach(change => {
                let logEvent = null;
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
                }
                else if (change.rangeLength > 0 && change.text.length > 0) {
                    // OVERWRITE event.
                    const replacedText = document.getText(change.range);
                    logEvent = {
                        timestamp,
                        event: "OVERWRITE",
                        range: rangeStr,
                        deleted: replacedText,
                        inserted: change.text
                    };
                }
                else {
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
                    this.logBuffer.push(logEvent);
                }
            });
        });
        this.disposables.push(docChangeDisposable);
        // Listen for selection (cursor) changes.
        const selectionDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
            const document = event.textEditor.document;
            const timestamp = new Date().toISOString();
            const selections = event.selections
                .map(sel => `${sel.start.line}:${sel.start.character}-${sel.end.line}:${sel.end.character}`)
                .join(",");
            const logEvent = {
                timestamp,
                event: "SELECTION",
                selection: selections
            };
            console.log(JSON.stringify(logEvent));
            this.logBuffer.push(logEvent);
        });
        this.disposables.push(selectionDisposable);
        // Listen for command execution events (UNDO, REDO, CUT) if available.
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
            console.warn("vscode.commands.onDidExecuteCommand not available; UNDO/REDO/CUT events will not be logged.");
        }
        // Flush the log buffer every 2 seconds to update the report file.
        const flushInterval = setInterval(() => {
            if (this.logBuffer.length > 0) {
                console.log("=== Flushing DetailedChangeTracker Logs ===");
                console.log(JSON.stringify(this.logBuffer, null, 2));
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor) {
                    const document = activeEditor.document;
                    const reportFilePath = this.getReportFilePath(document);
                    let reportData = { logs: [] };
                    if (fs.existsSync(reportFilePath)) {
                        try {
                            const content = fs.readFileSync(reportFilePath, 'utf8');
                            reportData = JSON.parse(content);
                            if (!Array.isArray(reportData.logs)) {
                                reportData.logs = [];
                            }
                        }
                        catch (err) {
                            console.error("Error reading report file:", err);
                        }
                    }
                    // Push each log event from logBuffer into reportData.logs.
                    this.logBuffer.forEach(event => {
                        reportData.logs.push(event);
                    });
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