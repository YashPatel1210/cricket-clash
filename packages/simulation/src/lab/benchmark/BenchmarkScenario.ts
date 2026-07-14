import { SimulationScenarioFactory } from "../SimulationScenarioFactory";

export interface BenchmarkScenario {
  readonly name: string;

  readonly iterations: number;

  readonly scenarioFactory: SimulationScenarioFactory;
}
