import { BenchmarkResult } from "./BenchmarkResult";

export class BenchmarkFormatter {
  public format(result: BenchmarkResult): string {
    const stats = result.getStatistics();

    return `
==========================================
Cricket Clash Benchmark
==========================================

Scenario              : ${result.getScenario().name}
Iterations            : ${stats.getIterations()}

Average Runs          : ${stats.getAverageRuns().toFixed(2)}
Average Overs         : ${stats.getAverageOvers().toFixed(2)}
Average Run Rate      : ${stats.getAverageRunRate().toFixed(2)}
Average Wickets       : ${stats.getAverageWickets().toFixed(2)}
Average Dot %         : ${stats.getAverageDotPercentage().toFixed(2)}
Average Boundary %    : ${stats.getAverageBoundaryPercentage().toFixed(2)}

==========================================
`.trim();
  }
}
