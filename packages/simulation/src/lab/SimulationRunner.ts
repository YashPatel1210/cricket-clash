import { SimulationReport } from "./SimulationReport";
import { SimulationScenario } from "./SimulationScenario";

export interface SimulationRunner {
  run(scenario: SimulationScenario): SimulationReport;
}
