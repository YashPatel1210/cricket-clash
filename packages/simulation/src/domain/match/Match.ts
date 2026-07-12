import { Team } from "../team";

import { MatchConditions } from "./conditions/MatchConditions";
import { InningsResult } from "./innings";
import { Toss } from "./toss/Toss";
import { MatchState } from "./MatchState";

export class Match {
  private state: MatchState = MatchState.NOT_STARTED;

  public constructor(
    private readonly teamA: Team,
    private readonly teamB: Team,
    private readonly conditions: MatchConditions,
    private readonly toss?: Toss,
    private readonly firstInnings?: InningsResult,
    private readonly secondInnings?: InningsResult,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.teamA === this.teamB) {
      throw new Error("A match requires two different teams.");
    }
  }

  public getTeamA(): Team {
    return this.teamA;
  }

  public getTeamB(): Team {
    return this.teamB;
  }

  public getConditions(): MatchConditions {
    return this.conditions;
  }

  public getToss(): Toss | undefined {
    return this.toss;
  }

  public getFirstInnings(): InningsResult | undefined {
    return this.firstInnings;
  }

  public getSecondInnings(): InningsResult | undefined {
    return this.secondInnings;
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
