"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// src/extension.ts
const vscode = require("vscode");
const DetailedChangeTracker_1 = require("./tracking/DetailedChangeTracker");
function activate(context) {
    console.log("Extension activated with DetailedChangeTracker!");
    vscode.window.showInformationMessage("PoGC Extension Activated!");
    // Instantiate the detailed change tracker to capture every editing action.
    const changeTracker = new DetailedChangeTracker_1.DetailedChangeTracker();
    context.subscriptions.push(changeTracker);
}
function deactivate() {
    console.log("Extension deactivated.");
}
//# sourceMappingURL=extension.js.map