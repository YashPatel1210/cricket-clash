import { BenchmarkStatistics } from "./BenchmarkStatistics";
import { BenchmarkScenario } from "./BenchmarkScenario";

export class BenchmarkResult {
  public constructor(
    private readonly scenario: BenchmarkScenario,
    private readonly statistics: BenchmarkStatistics,
  ) {}

  public getScenario(): BenchmarkScenario {
    return this.scenario;
  }

  public getStatistics(): BenchmarkStatistics {
    return this.statistics;
  }
}
