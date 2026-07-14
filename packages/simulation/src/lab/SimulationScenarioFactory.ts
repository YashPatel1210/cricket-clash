import { SimulationScenario } from "./SimulationScenario";

export interface SimulationScenarioFactory {
  create(): SimulationScenario;
}
