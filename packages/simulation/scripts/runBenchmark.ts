/**
 * runBenchmark.ts
 *
 * Runs 1000 T20 innings simulations and validates statistical output
 * against expected T20 ranges.
 *
 * Usage:
 *   pnpm --filter @cricket-clash/simulation benchmark
 */

import { RandomGenerator } from "../src/infrastructure/random";
import { MatchContextFactory } from "../src/domain/match/context/MatchContextFactory";
import { MatchConditions } from "../src/domain/match/conditions/MatchConditions";
import { PitchType } from "../src/domain/match/conditions/PitchType";
import { WeatherCondition } from "../src/domain/match/conditions/WeatherCondition";
import { Stadium } from "../src/domain/match/conditions/Stadium";
import { T20Configuration } from "../src/domain/match/configuration/T20Configuration";
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

const config     = new T20Configuration();
const conditions = new MatchConditions(PitchType.FLAT, WeatherCondition.SUNNY, new Stadium("MCG"));

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
    ),
    new InningsProcessor(),
  ),
);

const scenario = {
  name: "Average vs Average",
  iterations: 1000,
  scenarioFactory: new AverageVsAverageScenarioFactory(),
};

const benchmarkResult = benchmark.run(scenario);

console.log(new BenchmarkFormatter().format(benchmarkResult));

const validationSummary = new BenchmarkValidator().validate(
  benchmarkResult.getStatistics(),
  new T20BenchmarkValidationProfile().expectations(),
);

console.log("");
console.log(new ValidationFormatter().format(validationSummary));
