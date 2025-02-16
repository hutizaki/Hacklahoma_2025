"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const DetailedChangeTracker_1 = require("./tracking/DetailedChangeTracker");
const SwarmENS_1 = require("./SwarmENS");
let tracker = undefined;
function activate(context) {
    console.log("PoGC Extension Minimal activated");
    // Determine the workspace folder's root as storage base if available;
    // otherwise, use the extension's globalStorageUri.
    const workspaceFolder = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : context.globalStorageUri.fsPath;
    // Ensure the chosen storage folder exists.
    vscode.workspace.fs.createDirectory(vscode.Uri.file(workspaceFolder)).then(() => {
        console.log("Storage folder ensured at:", workspaceFolder);
    }, (err) => {
        console.error("Failed to create storage folder", err);
    });
    // Register the start command.
    let startCommand = vscode.commands.registerCommand('pogc.start', () => {
        if (!tracker) {
            // Create a new tracker, passing the workspace folder path.
            tracker = new DetailedChangeTracker_1.DetailedChangeTracker(workspaceFolder);
            context.subscriptions.push(tracker);
            vscode.commands.executeCommand('setContext', 'pogc.active', true);
            vscode.window.showInformationMessage("PoGC Extension Started!");
            console.log("Recording started");
        }
        else {
            vscode.window.showInformationMessage("Recording is already active.");
        }
    });
    // Register the stop command.
    let stopCommand = vscode.commands.registerCommand('pogc.stop', () => {
        if (tracker) {
            tracker.dispose();
            tracker = undefined;
            vscode.commands.executeCommand('setContext', 'pogc.active', false);
            vscode.window.showInformationMessage("PoGC Extension Stopped!");
            console.log("Recording stopped");
        }
        else {
            vscode.window.showInformationMessage("Recording is not active.");
        }
    });
    // Register the upload command.
    let uploadCommand = vscode.commands.registerCommand('pogc.upload', () => __awaiter(this, void 0, void 0, function* () {
        const files = yield vscode.window.showOpenDialog({
            canSelectMany: true,
            filters: { 'JSON Files': ['json'] }
        });
        if (files && files.length > 0) {
            for (const fileUri of files) {
                try {
                    const swarmHash = yield (0, SwarmENS_1.uploadRecordingFiles)(fileUri.fsPath);
                    vscode.window.showInformationMessage(`Uploaded ${fileUri.fsPath} to Swarm with hash ${swarmHash}`);
                }
                catch (err) {
                    vscode.window.showErrorMessage(`Failed to upload ${fileUri.fsPath}: ${err}`);
                }
            }
        }
    }));
    context.subscriptions.push(startCommand, stopCommand, uploadCommand);
}
function deactivate() {
    if (tracker) {
        tracker.dispose();
    }
    console.log("PoGC Extension Minimal deactivated.");
}
//# sourceMappingURL=extension.js.map