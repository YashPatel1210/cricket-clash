import { Team } from "../team";

import { MatchConditions } from "./conditions/MatchConditions";
import { MatchConfiguration } from "./configuration/MatchConfiguration";
import { InningsResult } from "./innings";
import { MatchState } from "./MatchState";
import { Toss } from "./toss/Toss";

export class Match {
  public constructor(
    private readonly teamA: Team,
    private readonly teamB: Team,
    private readonly conditions: MatchConditions,
    private readonly configuration: MatchConfiguration,
    private readonly state: MatchState = MatchState.NOT_STARTED,
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

  public getConfiguration(): MatchConfiguration {
    return this.configuration;
  }

  public getState(): MatchState {
    return this.state;
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

  public hasStarted(): boolean {
    return this.state !== MatchState.NOT_STARTED;
  }

  public isCompleted(): boolean {
    return this.state === MatchState.COMPLETED;
  }

  // ── Immutable state transitions ──────────────────────────────────────

  public withToss(toss: Toss): Match {
    return new Match(
      this.teamA,
      this.teamB,
      this.conditions,
      this.configuration,
      MatchState.TOSS,
      toss,
      this.firstInnings,
      this.secondInnings,
    );
  }

  public withFirstInnings(result: InningsResult): Match {
    return new Match(
      this.teamA,
      this.teamB,
      this.conditions,
      this.configuration,
      MatchState.INNINGS_BREAK,
      this.toss,
      result,
      this.secondInnings,
    );
  }

  public withSecondInnings(result: InningsResult): Match {
    return new Match(
      this.teamA,
      this.teamB,
      this.conditions,
      this.configuration,
      MatchState.COMPLETED,
      this.toss,
      this.firstInnings,
      result,
    );
  }
}
