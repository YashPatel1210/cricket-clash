import { BenchmarkMetric } from "../BenchmarkMetric";
import { ExpectedRange } from "../ExpectedRange";

export interface BenchmarkValidationProfile {
  expectations(): ReadonlyMap<BenchmarkMetric, ExpectedRange>;
}
