/*import { EthereumConnector } from "../ethereum/EthereumConnector";
import { ReportGenerator } from "./ReportGenerator";

export class BlockchainStorage {
  private ethConnector: EthereumConnector;
  private reportGenerator: ReportGenerator;

  constructor(ethConnector: EthereumConnector) {
    this.ethConnector = ethConnector;
    this.reportGenerator = new ReportGenerator();
  }

  public async storeReport(sessionData: any): Promise<void> {
    const report = this.reportGenerator.generateReport(sessionData);
    const reportStr = JSON.stringify(report);
    await this.ethConnector.storeDataOnChain(reportStr);
    console.log("Report stored on blockchain.");
  }
}
*/