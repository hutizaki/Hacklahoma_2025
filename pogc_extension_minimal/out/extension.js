"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const ChangeTracker_1 = require("./tracking/ChangeTracker");
let changeTracker;
function activate(context) {
    console.log('PoGC Extension Activated');
    changeTracker = new ChangeTracker_1.ChangeTracker();
    context.subscriptions.push(changeTracker);
}
// Flagged method: Answer below why you chose recur
// 
function deactivate() {
    console.log('PoGC Extension Deactivated');
    if (changeTracker) {
        changeTracker.dispose();
    }
}
//# sourceMappingURL=extension.js.map