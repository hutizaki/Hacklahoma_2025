export class ReportGenerator {
  public generateReport(sessionData: any): any {
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
