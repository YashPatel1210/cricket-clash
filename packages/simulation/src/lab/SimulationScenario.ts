import { MatchConfiguration } from "../domain/match/configuration";
import { Innings } from "../domain/match/innings";

export interface SimulationInningsFactory {
  create(): Innings;
}

export class SimulationScenario {
  public constructor(
    private readonly configuration: MatchConfiguration,
    private readonly inningsFactory: SimulationInningsFactory,
  ) {}

  public getConfiguration(): MatchConfiguration {
    return this.configuration;
  }

  public createInnings(): Innings {
    return this.inningsFactory.create();
  }
}
