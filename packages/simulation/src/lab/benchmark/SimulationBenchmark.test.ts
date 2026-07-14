import { describe, expect, it } from "vitest";

import { MatchRules } from "../../domain/match/configuration";

import { SimulationReport } from "../SimulationReport";
import { SimulationRunner } from "../SimulationRunner";
import { SimulationScenario } from "../SimulationScenario";
import { SimulationScenarioFactory } from "../SimulationScenarioFactory";

import { BenchmarkScenario } from "./BenchmarkScenario";
import { SimulationBenchmark } from "./SimulationBenchmark";

class FakeScenarioFactory implements SimulationScenarioFactory {
  public create(): SimulationScenario {
    return {} as SimulationScenario;
  }
}

class FakeSimulationRunner implements SimulationRunner {
  private executions = 0;

  public run(_: SimulationScenario): SimulationReport {
    this.executions++;

    return new SimulationReport(new MatchRules(20));
  }

  public getExecutions(): number {
    return this.executions;
  }
}

describe("SimulationBenchmark", () => {
  it("should execute the configured number of simulations", () => {
    const runner = new FakeSimulationRunner();

    const benchmark = new SimulationBenchmark(runner);

    const scenario: BenchmarkScenario = {
      name: "Average vs Average",
      iterations: 100,
      scenarioFactory: new FakeScenarioFactory(),
    };

    const result = benchmark.run(scenario);

    expect(runner.getExecutions()).toBe(100);

    expect(result.getScenario()).toBe(scenario);

    expect(result.getStatistics().getIterations()).toBe(100);
  });
});
