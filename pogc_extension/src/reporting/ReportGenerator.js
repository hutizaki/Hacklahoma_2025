"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = void 0;
class ReportGenerator {
    generateReport(sessionData) {
        const report = {
            sessionStart: sessionData.startTime,
            sessionEnd: new Date().toISOString(),
            totalKeystrokes: sessionData.keystrokes || 0,
            flaggedPastes: sessionData.pastes || 0,
        };
        console.log("Report generated:", report);
        return report;
    }
}
exports.ReportGenerator = ReportGenerator;
