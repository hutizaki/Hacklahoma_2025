"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeystrokeTracker = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class KeystrokeTracker {
    constructor() {
        this.disposables = [];
        this.buffer = [];
        this.filePath = null;
        this.initialize();
    }
    initialize() {
        const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const timestamp = new Date().toISOString();
            event.contentChanges.forEach(change => {
                if (change.text.trim()) {
                    this.buffer.push({
                        timestamp,
                        keystrokes: change.text
                    });
                }
            });
            // Set file path based on active document
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const fileName = path.basename(activeEditor.document.fileName, path.extname(activeEditor.document.fileName));
                const reportFileName = `${fileName}_report.json`;
                const fileDir = path.dirname(activeEditor.document.fileName);
                this.filePath = path.join(fileDir, reportFileName);
            }
        });
        this.disposables.push(disposable);
        // Save to JSON every second
        this.interval = setInterval(() => {
            if (this.filePath && this.buffer.length > 0) {
                this.saveToJson();
            }
        }, 1000);
    }
    saveToJson() {
        if (!this.filePath || this.buffer.length === 0)
            return;
        let existingData = [];
        // Read existing file data if present
        if (fs.existsSync(this.filePath)) {
            try {
                const fileContents = fs.readFileSync(this.filePath, 'utf8');
                existingData = JSON.parse(fileContents);
            }
            catch (error) {
                console.error("Error reading existing JSON file:", error);
            }
        }
        // Append buffer to existing data
        existingData.push(...this.buffer);
        this.buffer = []; // Clear buffer after writing
        // Write updated data back to the file
        fs.writeFileSync(this.filePath, JSON.stringify(existingData, null, 2), 'utf8');
        console.log(`Keystroke log updated: ${this.filePath}`);
    }
    dispose() {
        // Save any remaining keystrokes before exit
        this.saveToJson();
        // Cleanup
        this.disposables.forEach(d => d.dispose());
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
exports.KeystrokeTracker = KeystrokeTracker;
//# sourceMappingURL=KeystrokeTracker.js.map