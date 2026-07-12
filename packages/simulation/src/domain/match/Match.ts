import { Team } from "../team";
import { MatchConditions } from "./MatchConditions";
import { MatchState } from "./MatchState";

export class Match {
  private state: MatchState = MatchState.NOT_STARTED;

  public constructor(
    private readonly teamA: Team,
    private readonly teamB: Team,
    private readonly conditions: MatchConditions,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.teamA === this.teamB) {
      throw new Error("A match requires two different teams.");
    }
  }

  public getConditions(): MatchConditions {
    return this.conditions;
  }
  public getTeamA(): Team {
    return this.teamA;
  }

  public getTeamB(): Team {
    return this.teamB;
  }

  public getState(): MatchState {
    return this.state;
  }

  public hasStarted(): boolean {
    return this.state !== MatchState.NOT_STARTED;
  }

  public isCompleted(): boolean {
    return this.state === MatchState.COMPLETED;
  }
}
