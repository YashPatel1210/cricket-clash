import { SimulationRunner } from "../SimulationRunner";

import { BenchmarkAccumulator } from "./BenchmarkAccumulator";
import { BenchmarkResult } from "./BenchmarkResult";
import { BenchmarkScenario } from "./BenchmarkScenario";
import { BenchmarkStatistics } from "./BenchmarkStatistics";

export class SimulationBenchmark {
  public constructor(private readonly simulationRunner: SimulationRunner) {}

  public run(scenario: BenchmarkScenario): BenchmarkResult {
    const accumulator = new BenchmarkAccumulator();

    for (let iteration = 0; iteration < scenario.iterations; iteration++) {
      const simulation = scenario.scenarioFactory.create();

      const report = this.simulationRunner.run(simulation);

      accumulator.record(report);
    }

    return new BenchmarkResult(scenario, BenchmarkStatistics.from(accumulator));
  }
}
