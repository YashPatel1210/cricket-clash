import { DeliveryGenerator } from "../domain/match/delivery/DeliveryGenerator";

import { Innings, InningsProcessor } from "../domain/match/innings";

import { SimulationReport } from "./SimulationReport";
import { SimulationScenario } from "./SimulationScenario";

export class SimulationLab {
  public constructor(
    private readonly deliveryGenerator: DeliveryGenerator,
    private readonly inningsProcessor: InningsProcessor,
  ) {}

  public run(scenario: SimulationScenario): SimulationReport {
    const rules = scenario.configuration.getRules();

    const report = new SimulationReport(rules);

    let innings: Innings = scenario.innings;

    const maximumBalls = rules.getMaximumBalls();

    for (let ball = 0; ball < maximumBalls && !innings.isCompleted(); ball++) {
      const delivery = this.deliveryGenerator.generate(innings);

      report.record(delivery);

      innings = this.inningsProcessor.process(innings, delivery);
    }

    return report;
  }
}
