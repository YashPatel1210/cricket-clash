/**
 * runBenchmark.ts — runs 1000 simulations and validates against T20 targets.
 *
 * Usage: pnpm --filter @cricket-clash/simulation benchmark
 */
import { MatchConditions } from "../src/domain/match/conditions/MatchConditions";
import { PitchType } from "../src/domain/match/conditions/PitchType";
import { WeatherCondition } from "../src/domain/match/conditions/WeatherCondition";
import { Stadium } from "../src/domain/match/conditions/Stadium";
import { BoundarySize } from "../src/domain/match/conditions/BoundarySize";
import { T20Configuration } from "../src/domain/match/configuration/T20Configuration";
import { RandomGenerator } from "../src/infrastructure/random";
import { MatchContextFactory } from "../src/domain/match/context/MatchContextFactory";
import { DeliveryGenerator } from "../src/domain/match/delivery/DeliveryGenerator";
import { IntentEngine } from "../src/domain/match/intent/IntentEngine";
import { DefaultBatterIntentResolver } from "../src/domain/match/intent/DefaultBatterIntentResolver";
import { DefaultBowlerIntentResolver } from "../src/domain/match/intent/DefaultBowlerIntentResolver";
import { DefaultProbabilityEngineFactory } from "../src/domain/simulation/probability/DefaultProbabilityEngineFactory";
import { InningsProcessor } from "../src/domain/match/innings";
import { ValidationFormatter } from "../src/lab/validation";
import { BenchmarkValidator } from "../src/lab/validation";
import { SimulationLab } from "../src/lab";
import { BenchmarkFormatter, SimulationBenchmark } from "../src/lab/benchmark";
import { T20BenchmarkValidationProfile } from "../src/lab/validation/profiles";
import { AverageVsAverageScenarioFactory } from "../src/lab/scenarios/AverageVsAverageScenarioFactory";
import { T20TuningProfile } from "../src/domain/simulation/config/T20TuningProfile";

const config     = new T20Configuration();
const conditions = new MatchConditions(
  PitchType.FLAT,
  WeatherCondition.SUNNY,
  new Stadium("MCG", BoundarySize.LARGE),
);

const benchmark = new SimulationBenchmark(
  new SimulationLab(
    new DeliveryGenerator(
      new RandomGenerator(42),
      new MatchContextFactory(config, conditions),
      new IntentEngine(
        new DefaultBatterIntentResolver(),
        new DefaultBowlerIntentResolver(),
      ),
      DefaultProbabilityEngineFactory.create(),
      T20TuningProfile,
    ),
    new InningsProcessor(),
  ),
);

const benchmarkResult = benchmark.run({
  name: "Average vs Average (T20TuningProfile)",
  iterations: 1000,
  scenarioFactory: new AverageVsAverageScenarioFactory(),
});

console.log("\n" + new BenchmarkFormatter().format(benchmarkResult));

const validationSummary = new BenchmarkValidator().validate(
  benchmarkResult.getStatistics(),
  new T20BenchmarkValidationProfile().expectations(),
);

console.log("");
console.log(new ValidationFormatter().format(validationSummary));
