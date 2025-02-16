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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const KeystrokeTracker_1 = require("./tracking/KeystrokeTracker");
const PasteDetector_1 = require("./detection/PasteDetector");
const AiChecker_1 = require("./detection/AiChecker");
const InsertComments_1 = require("./comments/InsertComments");
let keystrokeTracker;
let pasteDetector;
let aiChecker;
let insertComments;
function activate(context) {
    console.log("Extension activated!");
    vscode.window.showInformationMessage('PoGC Extension Activated!');
    const outputChannel = vscode.window.createOutputChannel("PoGC Logs");
    outputChannel.appendLine("Extension activated!");
    // You could pass outputChannel to your trackers and call outputChannel.appendLine() there.
    // Initialize the modules and assign them to the outer variables
    keystrokeTracker = new KeystrokeTracker_1.KeystrokeTracker();
    pasteDetector = new PasteDetector_1.PasteDetector();
    aiChecker = new AiChecker_1.AiChecker();
    insertComments = new InsertComments_1.InsertComments();
    context.subscriptions.push(keystrokeTracker, pasteDetector, aiChecker, insertComments);
    // Example command registration
    let disposable = vscode.commands.registerCommand('pogc.showReport', () => {
        vscode.window.showInformationMessage('Report feature coming soon!');
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    if (keystrokeTracker)
        keystrokeTracker.dispose();
    if (pasteDetector)
        pasteDetector.dispose();
    if (aiChecker)
        aiChecker.dispose();
    if (insertComments)
        insertComments.dispose();
}
