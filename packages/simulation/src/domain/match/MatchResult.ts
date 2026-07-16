import { Team } from "../team";
import { InningsResult } from "./innings";
import { Scorecard } from "./scorecard/Scorecard";

export class MatchResult {
  public constructor(
    private readonly firstInnings: InningsResult,
    private readonly secondInnings: InningsResult,
    private readonly winner: Team | undefined,
    private readonly scorecard: Scorecard,
  ) {}

  public getFirstInnings(): InningsResult {
    return this.firstInnings;
  }

  public getSecondInnings(): InningsResult {
    return this.secondInnings;
  }

  public getWinner(): Team | undefined {
    return this.winner;
  }

  public getScorecard(): Scorecard {
    return this.scorecard;
  }
}
