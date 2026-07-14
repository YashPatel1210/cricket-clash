import { SimulationReport } from "../SimulationReport";

export class BenchmarkAccumulator {
  private iterations = 0;

  private totalRuns = 0;

  private totalOvers = 0;

  private totalRunRate = 0;

  private totalWickets = 0;

  private totalDotPercentage = 0;

  private totalBoundaryPercentage = 0;

  public record(report: SimulationReport): void {
    this.iterations++;

    this.totalRuns += report.getRuns();
    this.totalOvers += report.getOvers();
    this.totalRunRate += report.getRunRate();
    this.totalWickets += report.getWickets();
    this.totalDotPercentage += report.getDotPercentage();
    this.totalBoundaryPercentage += report.getBoundaryPercentage();
  }

  public getIterations(): number {
    return this.iterations;
  }

  public getTotalRuns(): number {
    return this.totalRuns;
  }

  public getTotalOvers(): number {
    return this.totalOvers;
  }

  public getTotalRunRate(): number {
    return this.totalRunRate;
  }

  public getTotalWickets(): number {
    return this.totalWickets;
  }

  public getTotalDotPercentage(): number {
    return this.totalDotPercentage;
  }

  public getTotalBoundaryPercentage(): number {
    return this.totalBoundaryPercentage;
  }
}
