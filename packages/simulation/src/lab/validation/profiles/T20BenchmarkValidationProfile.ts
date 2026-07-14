import { BenchmarkMetric } from "../BenchmarkMetric";
import { ExpectedRange } from "../ExpectedRange";

import { BenchmarkValidationProfile } from "./BenchmarkValidationProfile";

export class T20BenchmarkValidationProfile implements BenchmarkValidationProfile {
  public expectations(): ReadonlyMap<BenchmarkMetric, ExpectedRange> {
    return new Map([
      [BenchmarkMetric.AVERAGE_RUNS, new ExpectedRange(150, 180)],

      [BenchmarkMetric.AVERAGE_OVERS, new ExpectedRange(18.5, 20.0)],

      [BenchmarkMetric.AVERAGE_RUN_RATE, new ExpectedRange(7.5, 9.5)],

      [BenchmarkMetric.AVERAGE_WICKETS, new ExpectedRange(5, 8)],

      [BenchmarkMetric.AVERAGE_DOT_PERCENTAGE, new ExpectedRange(28, 38)],

      [BenchmarkMetric.AVERAGE_BOUNDARY_PERCENTAGE, new ExpectedRange(18, 28)],
    ]);
  }
}
