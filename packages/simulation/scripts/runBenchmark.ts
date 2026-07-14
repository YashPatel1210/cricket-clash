import { RandomGenerator } from "../src/infrastructure/random";
import { ValidationFormatter } from "../src/lab/validation";
import { DeliveryGenerator } from "../src/domain/match/delivery/DeliveryGenerator";
import { InningsProcessor } from "../src/domain/match/innings";
import { BenchmarkValidator } from "../src/lab/validation";
import { SimulationLab } from "../src/lab";
import { BenchmarkFormatter, SimulationBenchmark } from "../src/lab/benchmark";
import { T20BenchmarkValidationProfile } from "../src/lab/validation/profiles";
import { AverageVsAverageScenarioFactory } from "../src/lab/scenarios/AverageVsAverageScenarioFactory";
import { ValidationSummary } from "../src/lab/validation/ValidationSummary";

const benchmark = new SimulationBenchmark(
  new SimulationLab(
    new DeliveryGenerator(new RandomGenerator(42)),
    new InningsProcessor(),
  ),
);

const scenario = {
  name: "Average vs Average",
  iterations: 1000,
  scenarioFactory: new AverageVsAverageScenarioFactory(),
};

const benchmarkResult = benchmark.run(scenario);

const benchmarkFormatter = new BenchmarkFormatter();

console.log(benchmarkFormatter.format(benchmarkResult));

const validator = new BenchmarkValidator();

const validationSummary = validator.validate(
  benchmarkResult.getStatistics(),
  new T20BenchmarkValidationProfile().expectations(),
);

const validationFormatter = new ValidationFormatter();

console.log("");

console.log(validationFormatter.format(validationSummary));
