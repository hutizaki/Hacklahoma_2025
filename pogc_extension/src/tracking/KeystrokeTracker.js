"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeystrokeTracker = void 0;
const vscode = __importStar(require("vscode"));
class KeystrokeTracker {
    constructor() {
        this.disposables = [];
        this.initialize();
    }
    initialize() {
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
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.KeystrokeTracker = KeystrokeTracker;
