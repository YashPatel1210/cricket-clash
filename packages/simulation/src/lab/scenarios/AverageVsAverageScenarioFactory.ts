import { T20Configuration } from "../../domain/match/configuration";

import {
  SimulationInningsFactory,
  SimulationScenario,
  SimulationScenarioFactory,
} from "..";

import { InningsBuilder } from "../builders";

class AverageVsAverageInningsFactory implements SimulationInningsFactory {
  public create() {
    return InningsBuilder.standard().build();
  }
}

export class AverageVsAverageScenarioFactory implements SimulationScenarioFactory {
  public create(): SimulationScenario {
    return new SimulationScenario(
      new T20Configuration(),
      new AverageVsAverageInningsFactory(),
    );
  }
}
