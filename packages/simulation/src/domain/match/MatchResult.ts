import { Team } from "../team";
import { InningsResult } from "./innings";

export class MatchResult {
  public constructor(
    private readonly firstInnings: InningsResult,
    private readonly secondInnings: InningsResult,
    private readonly winner?: Team,
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
}
