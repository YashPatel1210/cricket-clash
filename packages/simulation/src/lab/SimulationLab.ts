import { DeliveryGenerator } from "../domain/match/delivery/DeliveryGenerator";

import { Innings, InningsProcessor } from "../domain/match/innings";

import { SimulationReport } from "./SimulationReport";
import { SimulationScenario } from "../lab/SimulationScenario";
import { SimulationRunner } from "./SimulationRunner";

export class SimulationLab implements SimulationRunner {
  public constructor(
    private readonly deliveryGenerator: DeliveryGenerator,
    private readonly inningsProcessor: InningsProcessor,
  ) {}

  public run(scenario: SimulationScenario): SimulationReport {
    const rules = scenario.getConfiguration().getRules();

    const report = new SimulationReport(rules);

    let innings = scenario.createInnings();

    const maximumBalls = rules.getMaximumBalls();

    for (let ball = 0; ball < maximumBalls && !innings.isCompleted(); ball++) {
      const delivery = this.deliveryGenerator.generate(innings);

      report.record(delivery);

      innings = this.inningsProcessor.process(innings, delivery);
    }

    return report;
  }
}
