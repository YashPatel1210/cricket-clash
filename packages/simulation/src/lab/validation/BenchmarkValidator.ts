import { BenchmarkStatistics } from "../benchmark";

import { BenchmarkMetric } from "./BenchmarkMetric";
import { ExpectedRange } from "./ExpectedRange";
import { ValidationResult } from "./ValidationResult";
import { ValidationSummary } from "./ValidationSummary";

export class BenchmarkValidator {
  public validate(
    statistics: BenchmarkStatistics,
    expectations: ReadonlyMap<BenchmarkMetric, ExpectedRange>,
  ): ValidationSummary {
    const results: ValidationResult[] = [];

    this.validateMetric(
      results,
      BenchmarkMetric.AVERAGE_RUNS,
      statistics.getAverageRuns(),
      expectations,
    );

    this.validateMetric(
      results,
      BenchmarkMetric.AVERAGE_OVERS,
      statistics.getAverageOvers(),
      expectations,
    );

    this.validateMetric(
      results,
      BenchmarkMetric.AVERAGE_RUN_RATE,
      statistics.getAverageRunRate(),
      expectations,
    );

    this.validateMetric(
      results,
      BenchmarkMetric.AVERAGE_WICKETS,
      statistics.getAverageWickets(),
      expectations,
    );

    this.validateMetric(
      results,
      BenchmarkMetric.AVERAGE_DOT_PERCENTAGE,
      statistics.getAverageDotPercentage(),
      expectations,
    );

    this.validateMetric(
      results,
      BenchmarkMetric.AVERAGE_BOUNDARY_PERCENTAGE,
      statistics.getAverageBoundaryPercentage(),
      expectations,
    );

    return new ValidationSummary(results);
  }

  private validateMetric(
    results: ValidationResult[],
    metric: BenchmarkMetric,
    actual: number,
    expectations: ReadonlyMap<BenchmarkMetric, ExpectedRange>,
  ): void {
    const expected = expectations.get(metric);

    if (!expected) {
      throw new Error(`Missing expected range for ${metric}.`);
    }

    results.push(new ValidationResult(metric, actual, expected));
  }
}
