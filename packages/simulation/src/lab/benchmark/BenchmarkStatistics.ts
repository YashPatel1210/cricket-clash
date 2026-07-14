import { BenchmarkAccumulator } from "./BenchmarkAccumulator";

export class BenchmarkStatistics {
  public static from(accumulator: BenchmarkAccumulator): BenchmarkStatistics {
    const iterations = accumulator.getIterations();

    if (iterations === 0) {
      throw new Error(
        "Cannot calculate benchmark statistics without recorded simulations.",
      );
    }

    return new BenchmarkStatistics(
      iterations,
      accumulator.getTotalRuns() / iterations,
      accumulator.getTotalOvers() / iterations,
      accumulator.getTotalRunRate() / iterations,
      accumulator.getTotalWickets() / iterations,
      accumulator.getTotalDotPercentage() / iterations,
      accumulator.getTotalBoundaryPercentage() / iterations,
    );
  }

  private constructor(
    private readonly iterations: number,
    private readonly averageRuns: number,
    private readonly averageOvers: number,
    private readonly averageRunRate: number,
    private readonly averageWickets: number,
    private readonly averageDotPercentage: number,
    private readonly averageBoundaryPercentage: number,
  ) {}

  public getIterations(): number {
    return this.iterations;
  }

  public getAverageRuns(): number {
    return this.averageRuns;
  }

  public getAverageOvers(): number {
    return this.averageOvers;
  }

  public getAverageRunRate(): number {
    return this.averageRunRate;
  }

  public getAverageWickets(): number {
    return this.averageWickets;
  }

  public getAverageDotPercentage(): number {
    return this.averageDotPercentage;
  }

  public getAverageBoundaryPercentage(): number {
    return this.averageBoundaryPercentage;
  }
}
