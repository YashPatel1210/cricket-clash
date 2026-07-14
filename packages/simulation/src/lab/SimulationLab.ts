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
    const report = new SimulationReport();

    let innings: Innings = scenario.innings;

    for (
      let ball = 0;
      ball < scenario.deliveries && !innings.isCompleted();
      ball++
    ) {
      const delivery = this.deliveryGenerator.generate(innings);

      report.record(delivery);

      innings = this.inningsProcessor.process(innings, delivery);
    }

    return report;
  }
}
