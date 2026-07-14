import { Innings } from "../domain/match/innings";

export interface SimulationScenario {
  readonly innings: Innings;

  readonly deliveries: number;
}
